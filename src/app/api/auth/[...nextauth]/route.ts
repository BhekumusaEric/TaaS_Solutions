/**
 * NextAuth.js API Route Handler
 *
 * This route handles all authentication-related API requests:
 * - Sign in: POST /api/auth/signin
 * - Sign out: POST /api/auth/signout
 * - Session: GET /api/auth/session
 * - CSRF token: GET /api/auth/csrf
 * - Providers: GET /api/auth/providers
 *
 * NextAuth.js automatically handles these endpoints based on the configuration
 * defined in src/lib/auth.ts
 *
 * @see https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth.js route handlers
 *
 * Exports GET and POST handlers that NextAuth.js uses to handle
 * authentication requests in the App Router.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
