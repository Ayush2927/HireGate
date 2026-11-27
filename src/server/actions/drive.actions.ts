'use server';

import { getCurrentUser } from '../auth/session';
import {
  createDrive,
  publishDrive,
  type CreateDriveInput,
} from '../services/drive.service';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Create a Placement Drive (Admin Only).
 */
export async function createDriveAction(data: CreateDriveInput) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'You must be logged in.' };
  }

  try {
    const result = await createDrive(actor, data);

    if (result.success) {
      revalidatePath('/admin/drives');
      revalidatePath('/drives');
    }

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create drive.';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Publish a Placement Drive (Admin Only).
 * Transitions drive from DRAFT -> PUBLISHED.
 */
export async function publishDriveAction(driveId: string) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false, error: 'You must be logged in.' };
  }

  try {
    const result = await publishDrive(actor, driveId);

    if (result.success) {
      revalidatePath('/admin/drives');
      revalidatePath('/drives');
    }

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish drive.';
    return {
      success: false,
      error: message,
    };
  }
}

