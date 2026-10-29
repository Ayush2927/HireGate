'use server';

import { auth } from '../auth';
import { applyToDrive, type ApplyResult } from '../services/application.service';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Submit Application to a Drive.
 * Triggered when a student clicks "Apply Now" on the UI.
 */
export async function applyToDriveAction(
  driveId: string,
  resumeId?: string,
  idempotencyKey?: string
): Promise<ApplyResult> {
  // 1. Authenticate the caller
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: {
        code: 'NOT_VERIFIED',
        message: 'You must be logged in to apply.',
      },
    };
  }

  // 2. Call the concurrency-safe transactional backend service
  const result = await applyToDrive({
    studentId: session.user.id,
    driveId,
    resumeId,
    idempotencyKey,
  });

  // 3. If successful, instantly purge stale cache so the UI updates
  if (result.success) {
    revalidatePath('/drives');
    revalidatePath('/applications');
  }

  return result;
}

