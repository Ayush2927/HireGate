import { eq } from 'drizzle-orm';
import { db } from '../db';
import {
  students,
  users,
  auditLogs,
  type Student,
  type User,
} from '../db/schema';
import { authorize } from '../auth/rbac';

// 1. Data shape for creating or updating a student profile
export interface UpsertStudentProfileInput {
  rollNo: string;
  branch: string;
  batch: number;
  cgpa: number;
  activeBacklogs: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
}

/**
 * 1. Fetch a complete student profile by User ID.
 */
export async function getStudentProfile(userId: string): Promise<Student | null> {
  const student = await db.query.students.findFirst({
    where: eq(students.userId, userId),
  });

  return student ?? null;
}

/**
 * 2. Create or Update Student Profile.
 *
 * CRITICAL RULE:
 * Students can edit their academic records ONLY while unverified.
 * Once verified by the TPO, academic fields are locked from student edits.
 */
export async function upsertStudentProfile(
  actor: User,
  targetUserId: string,
  data: UpsertStudentProfileInput
): Promise<{ success: boolean; student?: Student; error?: string }> {
  // Security Check: Only the student themselves or an Admin can edit this profile
  if (actor.id !== targetUserId && actor.role !== 'ADMIN') {
    return {
      success: false,
      error: 'You are not authorized to edit this profile.',
    };
  }

  // Check if profile already exists
  const existing = await getStudentProfile(targetUserId);

  // If already verified, students CANNOT edit their academic marks!
  if (existing?.verifiedAt && actor.role !== 'ADMIN') {
    return {
      success: false,
      error: 'Your profile has been verified and locked by the placement cell. Contact your TPO to request changes.',
    };
  }

  // Format numbers to exact strings for PostgreSQL numeric columns
  const formattedValues = {
    userId: targetUserId,
    rollNo: data.rollNo.trim().toUpperCase(),
    branch: data.branch.trim().toUpperCase(),
    batch: data.batch,
    cgpa: data.cgpa.toFixed(2),
    activeBacklogs: data.activeBacklogs,
    tenthPercentage: data.tenthPercentage ? data.tenthPercentage.toFixed(2) : null,
    twelfthPercentage: data.twelfthPercentage ? data.twelfthPercentage.toFixed(2) : null,
  };

  // Upsert: Insert if new, update if already exists
  const [updatedStudent] = await db
    .insert(students)
    .values(formattedValues)
    .onConflictDoUpdate({
      target: students.userId,
      set: formattedValues,
    })
    .returning();

  return { success: true, student: updatedStudent };
}

/**
 * 3. Verify Student Profile (Admin Only).
 *
 * Locks the student's profile and writes a transactional audit log.
 */
export async function verifyStudentProfile(
  actor: User,
  studentUserId: string
): Promise<{ success: boolean; student?: Student; error?: string }> {
  // Security: Central RBAC check (Throws ForbiddenError if not Admin)
  authorize(actor, 'VERIFY_STUDENT', 'STUDENT_PROFILE');

  return await db.transaction(async (tx) => {
    // 1. Fetch student
    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.userId, studentUserId));

    if (!student) {
      return { success: false, error: 'Student profile not found.' };
    }

    const now = new Date();

    // 2. Lock and stamp verification
    const [verifiedStudent] = await tx
      .update(students)
      .set({
        verifiedAt: now,
        verifiedBy: actor.id,
      })
      .where(eq(students.userId, studentUserId))
      .returning();

    // 3. Write immutable audit log in the same transaction
    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'student',
      entityId: studentUserId,
      action: 'VERIFY_STUDENT_PROFILE',
      diff: {
        before: { verifiedAt: student.verifiedAt, verifiedBy: student.verifiedBy },
        after: { verifiedAt: now.toISOString(), verifiedBy: actor.id },
      },
    });

    return { success: true, student: verifiedStudent };
  });
}

