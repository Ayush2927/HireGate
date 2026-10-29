import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import {
  students,
  drives,
  applications,
  auditLogs,
  type Application,
  type Student,
} from '../db/schema';
import { evaluateRules } from '../rules/evaluator';

export interface ApplyToDriveInput {
  studentId: string;
  driveId: string;
  resumeId?: string;
  idempotencyKey?: string;
}

export interface ApplicationServiceError {
  code:
    | 'ALREADY_APPLIED'
    | 'DRIVE_NOT_FOUND'
    | 'DRIVE_NOT_PUBLISHED'
    | 'DEADLINE_PASSED'
    | 'STUDENT_NOT_FOUND'
    | 'NOT_VERIFIED'
    | 'TIER_POLICY_VIOLATION'
    | 'INELIGIBLE';
  message: string;
  details?: unknown;
}

export type ApplyResult =
  | { success: true; application: Application }
  | { success: false; error: ApplicationServiceError };

const TIER_RANKS: Record<string, number> = {
  Mass: 1,
  Standard: 2,
  'Tier-1': 3,
  Dream: 4,
  'Super-Dream': 5,
};

/**
 * Checks whether an already placed student is allowed to apply to a new drive.
 *
 * College Placement Rule:
 * A student who is placed in a high tier (e.g. Dream) is LOCKED OUT from applying
 * to lower tiers (e.g. Mass/Standard), preserving spots for unplaced students.
 */
function checkPlacementTierPolicy(
  student: Student,
  driveTier: string
): { allowed: boolean; reason?: string } {
  if (student.placementStatus !== 'PLACED' || !student.placedTier) {
    return { allowed: true };
  }

  const currentRank = TIER_RANKS[student.placedTier] ?? 1;
  const targetRank = TIER_RANKS[driveTier] ?? 1;

  // Student can only apply if the new drive is in a STRICTLY HIGHER tier!
  if (targetRank <= currentRank) {
    return {
      allowed: false,
      reason: `You are already placed in a ${student.placedTier} tier company. You can only apply to higher tier drives (Current Rank: ${currentRank}, Drive Rank: ${targetRank}).`,
    };
  }
  return { allowed: true };
}

/**
 * Concurrency-Safe Application Submission.
 *
 * Executes the entire apply workflow in a single ACID database transaction:
 * 1. Fast-path Idempotency deduplication check.
 * 2. Pessimistic row locking on the student profile (FOR UPDATE).
 * 3. Server-side deadline check (ignores client clock manipulation).
 * 4. Placement tier policy check (tier lockouts).
 * 5. Rules engine validation (CGPA, backlogs, branch, 10th & 12th).
 * 6. Immutable profile snapshot creation.
 * 7. Transactional application insert + audit log record.
 */
export async function applyToDrive(
  input: ApplyToDriveInput
): Promise<ApplyResult> {
  const { studentId, driveId, resumeId, idempotencyKey } = input;

  // --------------------------------------------------------------------------
  // 1. FAST-PATH IDEMPOTENCY CHECK
  // --------------------------------------------------------------------------
  if (idempotencyKey) {
    const existing = await db.query.applications.findFirst({
      where: eq(applications.idempotencyKey, idempotencyKey),
    });
    if (existing) {
      return { success: true, application: existing };
    }
  }

  // Pre-check if already applied to this specific drive
  const alreadyApplied = await db.query.applications.findFirst({
    where: and(
      eq(applications.studentId, studentId),
      eq(applications.driveId, driveId)
    ),
  });
  if (alreadyApplied) {
    return {
      success: false,
      error: {
        code: 'ALREADY_APPLIED',
        message: 'You have already applied to this placement drive.',
      },
    };
  }

  // --------------------------------------------------------------------------
  // 2. BEGIN DATABASE TRANSACTION
  // --------------------------------------------------------------------------
  return await db.transaction(async (tx) => {
    // A. PESSIMISTIC ROW LOCK on Student
    const [lockedStudent] = await tx
      .select()
      .from(students)
      .where(eq(students.userId, studentId))
      .for('update');

    if (!lockedStudent) {
      return {
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student profile not found.',
        },
      };
    }

    if (!lockedStudent.verifiedAt) {
      return {
        success: false,
        error: {
          code: 'NOT_VERIFIED',
          message: 'Your profile has not been verified by the placement cell yet.',
        },
      };
    }

    // B. FETCH AND VALIDATE DRIVE
    const [drive] = await tx
      .select()
      .from(drives)
      .where(eq(drives.id, driveId));

    if (!drive) {
      return {
        success: false,
        error: {
          code: 'DRIVE_NOT_FOUND',
          message: 'Placement drive not found.',
        },
      };
    }

    if (drive.status !== 'PUBLISHED') {
      return {
        success: false,
        error: {
          code: 'DRIVE_NOT_PUBLISHED',
          message: 'This drive is not currently accepting applications.',
        },
      };
    }

    // C. SERVER-SIDE DEADLINE VALIDATION
    const serverNow = new Date();
    if (serverNow > drive.deadline) {
      return {
        success: false,
        error: {
          code: 'DEADLINE_PASSED',
          message: 'The deadline for this placement drive has already passed.',
        },
      };
    }

    // D. PLACEMENT TIER POLICY CHECK
    const policyResult = checkPlacementTierPolicy(lockedStudent, drive.tier);
    if (!policyResult.allowed) {
      return {
        success: false,
        error: {
          code: 'TIER_POLICY_VIOLATION',
          message: policyResult.reason || 'Placement policy lockout.',
        },
      };
    }

    // E. IN-MEMORY RULES ENGINE EVALUATION
    const ruleEvaluation = evaluateRules(drive.eligibilityRules, lockedStudent);
    if (!ruleEvaluation.eligible) {
      return {
        success: false,
        error: {
          code: 'INELIGIBLE',
          message: 'You do not meet the eligibility requirements for this drive.',
          details: ruleEvaluation.failedRules,
        },
      };
    }

    // F. IMMUTABLE APPLICATION SNAPSHOT
    // Freezes student profile state at the exact moment of application
    const profileSnapshot = {
      rollNo: lockedStudent.rollNo,
      branch: lockedStudent.branch,
      batch: lockedStudent.batch,
      cgpa: lockedStudent.cgpa,
      activeBacklogs: lockedStudent.activeBacklogs,
      tenthPercentage: lockedStudent.tenthPercentage,
      twelfthPercentage: lockedStudent.twelfthPercentage,
      verifiedAt: lockedStudent.verifiedAt.toISOString(),
      verifiedBy: lockedStudent.verifiedBy,
      appliedAt: serverNow.toISOString(),
    };

    // G. INSERT APPLICATION
    const [newApplication] = await tx
      .insert(applications)
      .values({
        studentId,
        driveId,
        resumeId: resumeId || null,
        profileSnapshot,
        status: 'APPLIED',
        idempotencyKey: idempotencyKey || null,
        appliedAt: serverNow,
      })
      .returning();

    // H. WRITE TRANSACTIONAL AUDIT LOG
    await tx.insert(auditLogs).values({
      actorId: studentId,
      entity: 'application',
      entityId: newApplication.id,
      action: 'APPLY_TO_DRIVE',
      diff: {
        driveId,
        driveTitle: drive.title,
        companyId: drive.companyId,
        tier: drive.tier,
        appliedAt: serverNow.toISOString(),
      },
    });

    return {
      success: true,
      application: newApplication,
    };
  });
}
