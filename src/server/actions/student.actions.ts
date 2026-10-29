'use server';

import { auth } from '../auth';
import {
  upsertStudentProfile,
  verifyStudentProfile,
  type UpsertStudentProfileInput,
} from '../services/student.service';
import { revalidatePath } from 'next/cache';
import type { User } from '../db/schema';

/**
 * Server Action: Update or Create Student Profile.
 * Students can edit their marks only while unverified.
 */
export async function updateProfileAction(
  data: UpsertStudentProfileInput,
  targetUserId?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to update your profile.' };
  }

  const actor = session.user as unknown as User;
  const targetId = targetUserId || actor.id;

  const result = await upsertStudentProfile(actor, targetId, data);

  if (result.success) {
    revalidatePath('/profile');
    revalidatePath('/drives');
  }

  return result;
}

/**
 * Server Action: Verify Student Profile (Admin Only).
 * Locks academic marks and creates an audit log entry.
 */
export async function verifyStudentAction(studentUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in.' };
  }

  const actor = session.user as unknown as User;

  try {
    const result = await verifyStudentProfile(actor, studentUserId);

    if (result.success) {
      revalidatePath('/admin/verify');
      revalidatePath('/profile');
    }

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify student.';
    return {
      success: false,
      error: message,
    };
  }
}

