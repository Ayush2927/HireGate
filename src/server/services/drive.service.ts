import { eq, and, gte, desc } from 'drizzle-orm';
import { db } from '../db';
import {
  drives,
  driveRounds,
  applications,
  auditLogs,
  type Drive,
  type User,
} from '../db/schema';
import { authorize } from '../auth/rbac';
import { EligibilityRuleSchema, type EligiblityRules } from '../rules/schema';
import { evaluateRules } from '../rules/evaluator';
import { getStudentProfile } from './student.service';

// 1. Input data for creating a placement drive
export interface CreateDriveInput {
  companyId: string;
  title: string;
  description: string;
  ctc: number; // In LPA (e.g. 18.5)
  tier: string; // e.g. "Dream", "Standard"
  deadline: Date;
  eligibilityRules: EligiblityRules;
  rounds?: string[]; // e.g. ["OA", "Technical Interview", "HR Interview"]
}

/**
 * 1. Create a Placement Drive (Admin Only).
 *
 * Validates eligibility rules JSON, creates sequential interview rounds,
 * and writes a transactional audit log.
 */
export async function createDrive(
  actor: User,
  data: CreateDriveInput
): Promise<{ success: boolean; drive?: Drive; error?: string }> {
  // Security Guard: Central RBAC
  authorize(actor, 'CREATE', 'DRIVE');

  // Validate the JSON rules tree with Zod before saving to DB
  const parsedRules = EligibilityRuleSchema.safeParse(data.eligibilityRules);
  if (!parsedRules.success) {
    return {
      success: false,
      error: 'Invalid eligibility rules format: ' + parsedRules.error.message,
    };
  }

  return await db.transaction(async (tx) => {
    // A. Insert the drive
    const [newDrive] = await tx
      .insert(drives)
      .values({
        collegeId: actor.collegeId,
        companyId: data.companyId,
        title: data.title.trim(),
        description: data.description.trim(),
        ctc: data.ctc.toFixed(2),
        tier: data.tier.trim(),
        deadline: data.deadline,
        eligibilityRules: parsedRules.data,
        status: 'DRAFT',
        createdBy: actor.id,
      })
      .returning();

    // B. Insert sequential interview rounds (if provided)
    if (data.rounds && data.rounds.length > 0) {
      const roundRows = data.rounds.map((roundName, index) => ({
        driveId: newDrive.id,
        name: roundName.trim(),
        sequence: index + 1, // 1, 2, 3...
      }));

      await tx.insert(driveRounds).values(roundRows);
    }

    // C. Write transactional audit log
    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'drive',
      entityId: newDrive.id,
      action: 'CREATE_DRIVE',
      diff: {
        title: newDrive.title,
        ctc: newDrive.ctc,
        tier: newDrive.tier,
        deadline: newDrive.deadline.toISOString(),
      },
    });

    return { success: true, drive: newDrive };
  });
}

/**
 * 2. Publish Drive (Admin Only).
 *
 * Moves drive from 'DRAFT' -> 'PUBLISHED', opening it to student applications.
 */
export async function publishDrive(
  actor: User,
  driveId: string
): Promise<{ success: boolean; drive?: Drive; error?: string }> {
  // Security Guard: Central RBAC
  authorize(actor, 'UPDATE', 'DRIVE');

  return await db.transaction(async (tx) => {
    const [drive] = await tx
      .select()
      .from(drives)
      .where(and(eq(drives.id, driveId), eq(drives.collegeId, actor.collegeId)));

    if (!drive) {
      return { success: false, error: 'Drive not found.' };
    }

    if (drive.status === 'PUBLISHED') {
      return { success: false, error: 'Drive is already published.' };
    }

    const [publishedDrive] = await tx
      .update(drives)
      .set({ status: 'PUBLISHED' })
      .where(eq(drives.id, driveId))
      .returning();

    // Write audit log
    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'drive',
      entityId: driveId,
      action: 'PUBLISH_DRIVE',
      diff: {
        before: { status: drive.status },
        after: { status: 'PUBLISHED' },
      },
    });

    return { success: true, drive: publishedDrive };
  });
}

/**
 * 3. Get Drives for Student Dashboard with Eligibility Diagnostics.
 *
 * Categorizes active drives into "eligible" and "ineligible" (with failed rules).
 */
export async function getDrivesForStudent(studentUserId: string) {
  const student = await getStudentProfile(studentUserId);
  const now = new Date();

  // Fetch all published drives where deadline has not passed
  const activeDrives = await db.query.drives.findMany({
    where: and(
      eq(drives.status, 'PUBLISHED'),
      gte(drives.deadline, now)
    ),
    with: {
      company: true,
      rounds: {
        orderBy: (rounds, { asc }) => [asc(rounds.sequence)],
      },
    },
    orderBy: [desc(drives.createdAt)],
  });

  // Fetch IDs of drives student has already applied to
  const studentApplications = await db.query.applications.findMany({
    where: eq(applications.studentId, studentUserId),
    columns: { driveId: true, status: true },
  });

  const appliedDriveMap = new Map(
    studentApplications.map((app) => [app.driveId, app.status])
  );

  // Evaluate eligibility for each drive
  const processedDrives = activeDrives.map((drive) => {
    const applicationStatus = appliedDriveMap.get(drive.id) ?? null;
    const hasApplied = applicationStatus !== null;

    // Run rules engine if student profile exists
    const evaluation = student
      ? evaluateRules(drive.eligibilityRules, student)
      : { eligible: false, failedRules: [] };

    return {
      ...drive,
      hasApplied,
      applicationStatus,
      isEligible: evaluation.eligible,
      failedRules: evaluation.failedRules,
    };
  });

  return {
    eligibleDrives: processedDrives.filter((d) => d.isEligible || d.hasApplied),
    ineligibleDrives: processedDrives.filter((d) => !d.isEligible && !d.hasApplied),
  };
}

