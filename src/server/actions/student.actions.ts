'use server';

import { getCurrentUser } from '../auth/session';
import {
  upsertStudentProfile,
  verifyStudentProfile,
  type UpsertStudentProfileInput,
} from '../services/student.service';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Update or Create Student Profile.
 * Students can edit their marks only while unverified.
 */
export async function updateProfileAction(
  data: UpsertStudentProfileInput,
  targetUserId?: string
) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'You must be logged in to update your profile.' };
  }

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
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'You must be logged in.' };
  }

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

