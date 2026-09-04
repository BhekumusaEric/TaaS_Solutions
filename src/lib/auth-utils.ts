/**
 * Authentication Utility Functions
 *
 * Helper functions for authentication and authorization checks.
 * All functions enforce server-side security validation.
 *
 * @module lib/auth-utils
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import type { Session } from 'next-auth';

/**
 * Get the current server-side session
 *
 * @returns Promise<Session | null> - Current session or null if not authenticated
 * @example
 * const session = await getSession();
 * if (session) {
 *   console.log('User:', session.user.email);
 * }
 */
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Require authentication - throws if not authenticated
 *
 * Use this function at the start of protected Server Actions or API routes
 * to ensure the user is authenticated before proceeding.
 *
 * @returns Promise<Session> - Current session (guaranteed to exist)
 * @throws {UnauthorizedError} If user is not authenticated
 *
 * @example
 * export async function createOpportunity(data: unknown) {
 *   const session = await requireAuth(); // Throws if not authenticated
 *   // ... proceed with authorized user
 * }
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session || !session.user) {
    throw new UnauthorizedError('Authentication required');
  }

  return session;
}

/**
 * Check if the current user is authenticated
 *
 * Non-throwing version of requireAuth for conditional logic.
 *
 * @returns Promise<boolean> - True if authenticated, false otherwise
 *
 * @example
 * const isAuthenticated = await isAuth();
 * if (isAuthenticated) {
 *   // Show authenticated content
 * }
 */
export async function isAuth(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Get the current user's ID
 *
 * @returns Promise<string | null> - User ID or null if not authenticated
 *
 * @example
 * const userId = await getCurrentUserId();
 * if (userId) {
 *   const user = await getUserById(userId);
 * }
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * Require the current user's ID - throws if not authenticated
 *
 * @returns Promise<string> - User ID (guaranteed to exist)
 * @throws {UnauthorizedError} If user is not authenticated
 *
 * @example
 * const userId = await requireUserId();
 * const user = await getUserById(userId); // userId is guaranteed to exist
 */
export async function requireUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}

/**
 * Check if a user owns a resource
 *
 * Helper function for ownership-based authorization.
 *
 * @param resourceUserId - The user ID associated with the resource
 * @returns Promise<boolean> - True if current user owns the resource
 *
 * @example
 * const opportunity = await getOpportunityById(id);
 * if (!(await isResourceOwner(opportunity.userId))) {
 *   throw new ForbiddenError('You can only edit your own opportunities');
 * }
 */
export async function isResourceOwner(resourceUserId: string): Promise<boolean> {
  const currentUserId = await getCurrentUserId();
  return currentUserId === resourceUserId;
}

/**
 * Require resource ownership - throws if not owner
 *
 * @param resourceUserId - The user ID associated with the resource
 * @param errorMessage - Custom error message (optional)
 * @throws {UnauthorizedError} If user is not authenticated
 * @throws {ForbiddenError} If user does not own the resource
 *
 * @example
 * const opportunity = await getOpportunityById(id);
 * await requireResourceOwnership(
 *   opportunity.userId,
 *   'You can only edit your own opportunities'
 * );
 */
export async function requireResourceOwnership(
  resourceUserId: string,
  errorMessage: string = 'You do not have permission to access this resource'
): Promise<void> {
  const currentUserId = await requireUserId();

  if (currentUserId !== resourceUserId) {
    throw new ForbiddenError(errorMessage);
  }
}

/**
 * Get current session with type safety
 *
 * Returns session with full type safety for user properties.
 * Useful for TypeScript type narrowing.
 *
 * @returns Promise<Session | null>
 */
export async function getAuthSession(): Promise<Session | null> {
  return await getSession();
}
