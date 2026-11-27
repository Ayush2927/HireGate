'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '../db';
import { auditLogs, companies } from '../db/schema';
import { authorize } from '../auth/rbac';
import { getCurrentUser } from '../auth/session';
import { createDrive, publishDrive } from '../services/drive.service';

const createCompanySchema = z.object({
  name: z.string().trim().min(2, 'Company name is required.'),
  website: z.string().trim().optional(),
});

export async function createCompanyAction(input: {
  name: string;
  website?: string;
}) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false as const, error: 'You must be logged in.' };
  }

  authorize(actor, 'CREATE', 'COMPANY');

  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid company data.',
    };
  }

  const [created] = await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companies)
      .values({
        collegeId: actor.collegeId,
        name: parsed.data.name,
        website: parsed.data.website || null,
      })
      .returning();

    await tx.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'company',
      entityId: company.id,
      action: 'CREATE_COMPANY',
      diff: { name: company.name, website: company.website },
    });

    return [company];
  });

  revalidatePath('/admin/companies');
  revalidatePath('/admin/drives/new');
  return { success: true as const, company: created };
}

export async function createAndPublishDriveAction(input: {
  companyId?: string;
  newCompanyName?: string;
  title: string;
  description: string;
  ctc: number;
  tier: string;
  deadlineIso: string;
  minCgpa: number;
  maxBacklogs: number;
  branches: string[];
  rounds: string[];
  publishImmediately: boolean;
}) {
  const actor = await getCurrentUser();
  if (!actor) {
    return { success: false as const, error: 'You must be logged in.' };
  }

  authorize(actor, 'CREATE', 'DRIVE');

  let companyId = input.companyId;
  if (!companyId && input.newCompanyName?.trim()) {
    const existing = await db.query.companies.findFirst({
      where: eq(companies.name, input.newCompanyName.trim()),
    });
    if (existing && existing.collegeId === actor.collegeId) {
      companyId = existing.id;
    } else {
      const companyRes = await createCompanyAction({
        name: input.newCompanyName.trim(),
      });
      if (!companyRes.success) {
        return { success: false as const, error: companyRes.error };
      }
      companyId = companyRes.company.id;
    }
  }

  if (!companyId) {
    return {
      success: false as const,
      error: 'Please select or enter a company name.',
    };
  }

  const deadline = new Date(input.deadlineIso);
  if (Number.isNaN(deadline.getTime())) {
    return { success: false as const, error: 'Invalid deadline date.' };
  }

  const createRes = await createDrive(actor, {
    companyId,
    title: input.title,
    description: input.description,
    ctc: input.ctc,
    tier: input.tier,
    deadline,
    eligibilityRules: {
      all: [
        { field: 'branch', op: 'in', value: input.branches },
        { field: 'cgpa', op: 'gte', value: input.minCgpa },
        { field: 'active_backlogs', op: 'lte', value: input.maxBacklogs },
      ],
    },
    rounds: input.rounds,
  });

  if (!createRes.success || !createRes.drive) {
    return {
      success: false as const,
      error: createRes.error ?? 'Failed to create drive.',
    };
  }

  if (input.publishImmediately) {
    const pubRes = await publishDrive(actor, createRes.drive.id);
    if (!pubRes.success) {
      return {
        success: false as const,
        error: pubRes.error ?? 'Drive created as draft, but publishing failed.',
      };
    }
  }

  revalidatePath('/admin/drives');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/student/drives');
  return { success: true as const, driveId: createRes.drive.id };
}
