'use server';

import { auth } from '../auth';
import {
  createDrive,
  publishDrive,
  type CreateDriveInput,
} from '../services/drive.service';
import { revalidatePath } from 'next/cache';
import type { User } from '../db/schema';

/**
 * Server Action: Create a Placement Drive (Admin Only).
 */
export async function createDriveAction(data: CreateDriveInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in.' };
  }

  const actor = session.user as unknown as User;

  try {
    const result = await createDrive(actor, data);

    if (result.success) {
      revalidatePath('/admin/drives');
      revalidatePath('/drives');
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create drive.',
    };
  }
}

/**
 * Server Action: Publish a Placement Drive (Admin Only).
 * Transitions drive from DRAFT -> PUBLISHED.
 */
export async function publishDriveAction(driveId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in.' };
  }

  const actor = session.user as unknown as User;

  try {
    const result = await publishDrive(actor, driveId);

    if (result.success) {
      revalidatePath('/admin/drives');
      revalidatePath('/drives');
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to publish drive.',
    };
  }
}

