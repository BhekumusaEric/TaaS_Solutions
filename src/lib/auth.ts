/**
 * NextAuth.js Configuration
 *
 * This module configures authentication for the TaaS Solutions platform using NextAuth.js.
 * It implements a credentials-based authentication flow with JWT session strategy.
 *
 * Security Features:
 * - Password verification using bcrypt
 * - HTTP-only secure cookies
 * - JWT session tokens (7-day expiry)
 * - Server-side session validation
 *
 * @module lib/auth
 */

import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { UnauthorizedError } from '@/lib/errors';

/**
 * NextAuth.js configuration options
 *
 * Configures:
 * - Prisma database adapter for session/account storage
 * - Credentials provider for email/password authentication
 * - JWT session strategy (stateless)
 * - Custom sign-in/error pages
 * - Session callbacks for user data enrichment
 */
export const authOptions: NextAuthOptions = {
  // Database adapter for NextAuth.js tables (Account, Session, VerificationToken)
  adapter: PrismaAdapter(db),

  // Authentication providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          throw new UnauthorizedError('Email and password are required');
        }

        // Find user by email
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        });

        // User not found or no password set (OAuth users)
        if (!user || !user.password) {
          throw new UnauthorizedError('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new UnauthorizedError('Invalid email or password');
        }

        // Return user object (password excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt', // Stateless JWT sessions
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },

  // Custom pages
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // Callbacks for session and JWT customization
  callbacks: {
    /**
     * JWT callback - called when JWT is created or updated
     * Adds user ID to token for session retrieval
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: add user ID to token
      if (user) {
        token.id = user.id;
      }

      // Session update: sync token with session data
      if (trigger === 'update' && session) {
        token.name = session.name;
      }

      return token;
    },

    /**
     * Session callback - called when session is accessed
     * Enriches session with user data from token
     */
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Security configuration
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true, // Prevent JavaScript access
        sameSite: 'lax', // CSRF protection
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      },
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Secret for JWT signing and encryption
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Type augmentation for NextAuth session
 * Adds user ID to session.user type
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
