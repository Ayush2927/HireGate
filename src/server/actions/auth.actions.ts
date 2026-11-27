'use server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { colleges, users } from '../db/schema';
import { auth, signOut } from '../auth';
import { isAllowedCollegeDomain } from '../auth/config';
import { hashPassword } from '../auth/password';
import { checkAuthRateLimit } from '../redis';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required.'),
  collegeName: z.string().trim().min(2, 'Institution name is required.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Public self-registration:
 * - Only allows the configured college email domain.
 * - Always assigns role = 'STUDENT' on the server.
 */
export async function registerStudentAction(
  input: z.infer<typeof registerSchema>
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid registration details.',
    };
  }

  const { name, collegeName, email, password } = parsed.data;

  const rate = await checkAuthRateLimit(`register:${email}`);

  if (!rate.allowed) {
    return {
      success: false,
      error: 'Too many registration attempts. Please try again in a minute'
    }
  }

  // 1. Enforce institutional email domain
  if (!isAllowedCollegeDomain(email)) {
    const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
    return {
      success: false,
      error: `Only @${domain} emails can self-register. Recruiters must be invited by an Admin.`,
    };
  }

  // 2. Reject duplicate emails
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists.',
    };
  }

  const domain = email.split('@')[1]!;
  const passwordHash = hashPassword(password);

  // 3. Find or create the college row, then insert user with role = 'STUDENT'
  await db.transaction(async (tx) => {
    let college = await tx.query.colleges.findFirst({
      where: eq(colleges.emailDomain, domain),
    });

    if (!college) {
      const [created] = await tx
        .insert(colleges)
        .values({ name: collegeName, emailDomain: domain })
        .returning();
      college = created;
    }

    await tx.insert(users).values({
      collegeId: college.id,
      email,
      name,
      passwordHash,
      role: 'STUDENT', // Hardcoded server-side — never accepted from client
      tokenVersion: 0,
    });
  });

  return { success: true };
}

/**
 * Server Action: Sign Out
 * 1. Increments tokenVersion in Neon to invalidate all existing JWT cookies.
 * 2. Clears the NextAuth HttpOnly cookie and redirects to /login.
 */
export async function signOutAction() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (userId) {
    await db
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, userId));
  }

  await signOut({ redirectTo: '/login' });
}
