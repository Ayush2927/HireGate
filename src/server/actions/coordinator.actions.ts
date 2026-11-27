'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '../db';
import {
  applications,
  auditLogs,
  driveRounds,
  notifications,
  roundResults,
} from '../db/schema';
import { authorize } from '../auth/rbac';
import { getCurrentUser } from '../auth/session';

const updateRoundSchema = z.object({
  applicationId: z.string().uuid(),
  roundId: z.string().uuid(),
  result: z.enum(['PENDING', 'PASSED', 'FAILED', 'ABSENT']),
});

export async function updateRoundResultAction(input: {
  applicationId: string;
  roundId: string;
  result: 'PENDING' | 'PASSED' | 'FAILED' | 'ABSENT';
}) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false as const, error: 'You must be logged in.' };
  }

  authorize(actor, 'UPLOAD_ROUND_RESULTS', 'ROUND_RESULT');

  const parsed = updateRoundSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Invalid round result payload.' };
  }

  const { applicationId, roundId, result } = parsed.data;

  await db.transaction(async (tx) => {
    const existing = await tx.query.roundResults.findFirst({
      where: and(
        eq(roundResults.applicationId, applicationId),
        eq(roundResults.roundId, roundId)
      ),
    });

    await tx
      .insert(roundResults)
      .values({
        applicationId,
        roundId,
        result,
        updatedBy: actor.id,
      })
      .onConflictDoUpdate({
        target: [roundResults.applicationId, roundResults.roundId],
        set: {
          result,
          updatedBy: actor.id,
          updatedAt: new Date(),
        },
      });

    if (result === 'FAILED' || result === 'ABSENT') {
      await tx
        .update(applications)
        .set({ status: 'REJECTED' })
        .where(eq(applications.id, applicationId));
    } else if (result === 'PASSED') {
      const round = await tx.query.driveRounds.findFirst({
        where: eq(driveRounds.id, roundId),
      });
      if (round) {
        await tx
          .update(applications)
          .set({ status: 'IN_PROGRESS' })
          .where(eq(applications.id, applicationId));
      }
    }

    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'round_result',
      entityId: `${applicationId}:${roundId}`,
      action: 'UPDATE_ROUND_RESULT',
      diff: {
        before: existing?.result ?? 'PENDING',
        after: result,
      },
    });
  });

  revalidatePath('/coordinator/rounds');
  revalidatePath('/coordinator/attendance');
  revalidatePath('/coordinator/results');
  revalidatePath('/student/applications');
  return { success: true as const };
}

export async function postAnnouncementAction(input: {
  driveId: string;
  title: string;
  venue: string;
  message: string;
}) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false as const, error: 'You must be logged in.' };
  }

  authorize(actor, 'UPDATE', 'DRIVE');

  const apps = await db.query.applications.findMany({
    where: eq(applications.driveId, input.driveId),
    columns: { studentId: true },
  });

  const refId = `${input.driveId}-${Date.now()}`;

  await db.transaction(async (tx) => {
    const recipientIds =
      apps.length > 0 ? apps.map((a) => a.studentId) : [actor.id];

    for (const userId of recipientIds) {
      await tx.insert(notifications).values({
        userId,
        type: 'ROUND_ANNOUNCEMENT',
        refId,
        payload: {
          driveId: input.driveId,
          title: input.title.trim(),
          venue: input.venue.trim(),
          message: input.message.trim(),
        },
      });
    }

    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'drive',
      entityId: input.driveId,
      action: 'POST_ANNOUNCEMENT',
      diff: { title: input.title, recipients: recipientIds.length },
    });
  });

  revalidatePath('/coordinator/announcements');
  return { success: true as const };
}
