import { eq } from 'drizzle-orm';
import { auth } from './index';
import { db } from '../db';
import { users, type User } from '../db/schema';

/**
 * Reads the NextAuth JWT session AND verifies `tokenVersion` against Neon.
 * Returns null if unauthenticated or if the token was revoked by Sign Out.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const sessionUser = session?.user as
    | { id?: string; tokenVersion?: number }
    | undefined;

  if (!sessionUser?.id) {
    return null;
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, sessionUser.id),
  });

  if (!dbUser) {
    return null;
  }

  // Revocation check: if Sign Out bumped tokenVersion in DB, reject old cookies
  if (dbUser.tokenVersion !== (sessionUser.tokenVersion ?? 0)) {
    return null;
  }

  return dbUser;
}
