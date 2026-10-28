import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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
    // 1. Google OAuth Provider (for production)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),

    // 2. Credentials Provider (for local development & testing different roles)
    CredentialsProvider({
      name: 'College Credentials',
      credentials: {
        email: { label: 'College Email', type: 'email', placeholder: 'ayush@college.edu' },
      },
      async authorize(credentials) {
        if (!credentials?.email || typeof credentials.email !== 'string') {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        // Security check: Must end with @college.edu
        if (!isAllowedCollegeDomain(email)) {
          throw new Error(
            `Only emails from @${process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu'} are allowed to access HireGate.`
          );
        }

        // Look up the user in PostgreSQL
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          collegeId: user.collegeId,
        };
      },
    }),
  ],

  callbacks: {
    // A. Check domain before allowing sign-in
    async signIn({ user }) {
      if (!user.email) return false;

      if (!isAllowedCollegeDomain(user.email)) {
        return false; // Blocks sign-in at the gate
      }

      return true;
    },

    // B. Attach role & collegeId to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.collegeId = (user as any).collegeId;
      }
      return token;
    },

    // C. Expose role & collegeId to the client session
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) || session.user.id;
        (session.user as any).role = token.role;
        (session.user as any).collegeId = token.collegeId;
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
  },
};

