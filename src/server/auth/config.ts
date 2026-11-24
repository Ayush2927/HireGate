import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { verifyPassword } from './password';

/**
 * Validates whether an email belongs to the allowed college domain.
 * Example: ayush@college.edu -> true; ayush@gmail.com -> false.
 */
export function isAllowedCollegeDomain(email: string): boolean {
  const allowedDomain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
  return email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'HireGate Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@college.edu' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // 1. Look up user in Neon PostgreSQL
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // 2. Domain check: everyone except RECRUITER must use the college domain
        if (user.role !== 'RECRUITER' && !isAllowedCollegeDomain(user.email)) {
          return null;
        }

        // 3. Constant-time password verification
        const isValid = verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // 4. Return fields to be embedded into the encrypted JWT cookie
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          collegeId: user.collegeId,
          companyId: user.companyId,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],

  callbacks: {
    // Runs on sign-in and whenever the JWT is read
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id?: string;
          role?: string;
          collegeId?: string;
          companyId?: string | null;
          tokenVersion?: number;
        };
        token.id = u.id;
        token.role = u.role;
        token.collegeId = u.collegeId;
        token.companyId = u.companyId ?? null;
        token.tokenVersion = u.tokenVersion ?? 0;
      }
      return token;
    },

    // Exposes token claims on `await auth()` and `useSession()`
    async session({ session, token }) {
      if (session.user && token) {
        const su = session.user as unknown as {
          id?: string;
          role?: unknown;
          collegeId?: unknown;
          companyId?: unknown;
          tokenVersion?: unknown;
        };
        su.id = (token.id as string) || session.user.id;
        su.role = token.role;
        su.collegeId = token.collegeId;
        su.companyId = token.companyId;
        su.tokenVersion = token.tokenVersion;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,    // Refresh cookie once per 24 hours of activity
  },
};