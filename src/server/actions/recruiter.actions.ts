'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '../db';
import { applications, auditLogs, students } from '../db/schema';
import { getCurrentUser } from '../auth/session';

const statusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    'APPLIED',
    'SHORTLISTED',
    'IN_PROGRESS',
    'REJECTED',
    'OFFERED',
  ]),
});

export async function updateCandidateStatusAction(input: {
  applicationId: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'IN_PROGRESS' | 'REJECTED' | 'OFFERED';
}) {
  const actor = await getCurrentUser();
  if (!actor || (actor.role !== 'RECRUITER' && actor.role !== 'ADMIN')) {
    return {
      success: false as const,
      error: 'Only Recruiters or Admins can update candidate statuses.',
    };
  }

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid status update.' };
  }

  const { applicationId, status } = parsed.data;

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { drive: true },
  });

  if (!app || app.drive.collegeId !== actor.collegeId) {
    return { success: false as const, error: 'Application not found.' };
  }

  if (
    actor.role === 'RECRUITER' &&
    actor.companyId &&
    app.drive.companyId !== actor.companyId
  ) {
    return {
      success: false as const,
      error: 'You are not authorized to manage another company’s drive.',
    };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(applications)
      .set({ status })
      .where(eq(applications.id, applicationId));

    if (status === 'OFFERED') {
      await tx
        .update(students)
        .set({
          placementStatus: 'PLACED',
          placedTier: app.drive.tier,
        })
        .where(eq(students.userId, app.studentId));
    }

    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'application',
      entityId: applicationId,
      action: 'RECRUITER_STATUS_UPDATE',
      diff: { before: app.status, after: status },
    });
  });

  revalidatePath('/recruiter/dashboard');
  revalidatePath('/recruiter/applicants');
  revalidatePath('/recruiter/shortlisted');
  revalidatePath('/student/applications');
  revalidatePath('/student/dashboard');
  return { success: true as const };
}
