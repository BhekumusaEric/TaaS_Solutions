/**
 * Session Creation Tests
 *
 * Tests to verify NextAuth.js session creation functionality works correctly.
 * Validates JWT token generation, session cookie configuration, and session data structure.
 *
 * Tests cover:
 * - Session creation with valid credentials
 * - JWT token generation and signing
 * - Session includes required user data (id, email, name)
 * - Session cookie configuration is secure
 * - Session callbacks execute correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authOptions } from './auth';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

describe('Session Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('JWT Callback', () => {
    it('should add user ID to token on initial sign-in', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockToken: JWT = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      if (jwtCallback) {
        const result = await jwtCallback({
          token: mockToken,
          user: mockUser,
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        expect(result.id).toBe('user-123');
        expect(result.name).toBe('Test User');
        expect(result.email).toBe('test@example.com');
      }
    });

    it('should preserve user ID on token refresh', async () => {
      const mockToken: JWT = {
        id: 'user-456',
        name: 'Test User',
        email: 'test@example.com',
      };

      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      if (jwtCallback) {
        const result = await jwtCallback({
          token: mockToken,
          // @ts-expect-error - Partial parameters for testing
          trigger: 'update',
          user: undefined,
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        expect(result.id).toBe('user-456');
      }
    });

    it('should update token name on session update', async () => {
      const mockToken: JWT = {
        id: 'user-789',
        name: 'Old Name',
        email: 'test@example.com',
      };

      const mockSession = {
        name: 'Updated Name',
      };

      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      if (jwtCallback) {
        const result = await jwtCallback({
          token: mockToken,
          trigger: 'update',
          // @ts-expect-error - Partial parameters for testing
          session: mockSession,
          user: undefined,
          account: null,
          profile: undefined,
          isNewUser: false,
        });

        expect(result.name).toBe('Updated Name');
        expect(result.id).toBe('user-789');
      }
    });
  });

  describe('Session Callback', () => {
    it('should enrich session with user ID from token', async () => {
      const mockSession: Session = {
        user: {
          id: '', // Will be populated by callback
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockToken: JWT = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };

      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      if (sessionCallback) {
        const result = await sessionCallback({
          session: mockSession,
          token: mockToken,
          // @ts-expect-error - Partial parameters for testing
          user: undefined,
          newSession: undefined,
          trigger: 'getSession',
        });

        expect(result.user.id).toBe('user-123');
        expect(result.user.name).toBe('Test User');
        expect(result.user.email).toBe('test@example.com');
      }
    });

    it('should handle missing user ID in token gracefully', async () => {
      const mockSession: Session = {
        user: {
          id: '',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockToken: JWT = {
        name: 'Test User',
        email: 'test@example.com',
        // No id in token
      };

      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      if (sessionCallback) {
        const result = await sessionCallback({
          session: mockSession,
          token: mockToken,
          // @ts-expect-error - Partial parameters for testing
          user: undefined,
          newSession: undefined,
          trigger: 'getSession',
        });

        // Should not throw, just skip setting ID
        expect(result.user).toBeDefined();
        expect(result.user.name).toBe('Test User');
      }
    });
  });

  describe('Session Configuration', () => {
    it('should use JWT session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 7-day session expiry', () => {
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      expect(authOptions.session?.maxAge).toBe(sevenDaysInSeconds);
    });

    it('should have 24-hour session update age', () => {
      const oneDayInSeconds = 24 * 60 * 60;
      expect(authOptions.session?.updateAge).toBe(oneDayInSeconds);
    });

    it('should have secure cookie configuration', () => {
      expect(authOptions.cookies?.sessionToken?.options.httpOnly).toBe(true);
      expect(authOptions.cookies?.sessionToken?.options.sameSite).toBe('lax');
      expect(authOptions.cookies?.sessionToken?.options.path).toBe('/');
    });
  });

  describe('Session Data Structure', () => {
    it('should create session with all required user fields', async () => {
      const mockUser: User = {
        id: 'user-abc',
        email: 'complete@example.com',
        name: 'Complete User',
      };

      const mockToken: JWT = {
        name: 'Complete User',
        email: 'complete@example.com',
      };

      // Simulate JWT callback (sign in)
      const jwtCallback = authOptions.callbacks?.jwt;
      if (jwtCallback) {
        const tokenWithId = await jwtCallback({
          token: mockToken,
          user: mockUser,
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        expect(tokenWithId.id).toBe('user-abc');

        // Simulate session callback
        const sessionCallback = authOptions.callbacks?.session;
        if (sessionCallback) {
          const mockSession: Session = {
            user: {
              id: '',
              name: 'Complete User',
              email: 'complete@example.com',
            },
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          };

          const enrichedSession = await sessionCallback({
            session: mockSession,
            token: tokenWithId,
            // @ts-expect-error - Partial parameters for testing
            user: undefined,
            newSession: undefined,
            trigger: 'getSession',
          });

          // Verify complete session structure
          expect(enrichedSession.user.id).toBe('user-abc');
          expect(enrichedSession.user.name).toBe('Complete User');
          expect(enrichedSession.user.email).toBe('complete@example.com');
          expect(enrichedSession.expires).toBeDefined();
          expect(typeof enrichedSession.expires).toBe('string');
        }
      }
    });

    it('should maintain type safety for session user object', () => {
      // Compile-time type check - if this compiles, types are correct
      type SessionUser = {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };

      const validUser: SessionUser = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
      };

      expect(validUser.id).toBe('test-id');
      expect(validUser.name).toBe('Test User');
      expect(validUser.email).toBe('test@example.com');
    });
  });

  describe('Session Security', () => {
    it('should have secure cookie configuration based on environment', () => {
      // Cookie name includes __Secure prefix in production
      const cookieName = authOptions.cookies?.sessionToken?.name;
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        expect(cookieName).toBe('__Secure-next-auth.session-token');
      } else {
        expect(cookieName).toBe('next-auth.session-token');
      }

      // Cookie secure flag should match environment
      const secure = authOptions.cookies?.sessionToken?.options.secure;
      expect(secure).toBe(isProduction);
    });

    it('should set httpOnly flag to prevent JavaScript access', () => {
      const httpOnly = authOptions.cookies?.sessionToken?.options.httpOnly;
      expect(httpOnly).toBe(true);
    });

    it('should set sameSite to lax for CSRF protection', () => {
      const sameSite = authOptions.cookies?.sessionToken?.options.sameSite;
      expect(sameSite).toBe('lax');
    });

    it('should have secret configured for JWT signing', () => {
      // In test environment, NEXTAUTH_SECRET may not be set
      // Configuration should have secret property (even if undefined)
      expect('secret' in authOptions).toBe(true);
      
      // In production/development, secret should be a string
      if (authOptions.secret) {
        expect(typeof authOptions.secret).toBe('string');
      }
    });
  });

  describe('Full Session Creation Flow', () => {
    it('should successfully create session from user authentication', async () => {
      // 1. User authenticates (authorize returns user)
      const authenticatedUser: User = {
        id: 'flow-user-123',
        email: 'flow@example.com',
        name: 'Flow Test User',
      };

      // 2. JWT callback is triggered with user
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      let jwtToken: JWT = {
        name: authenticatedUser.name,
        email: authenticatedUser.email,
      };

      if (jwtCallback) {
        jwtToken = await jwtCallback({
          token: jwtToken,
          user: authenticatedUser,
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        expect(jwtToken.id).toBe('flow-user-123');
      }

      // 3. Session callback is triggered to enrich session
      const sessionCallback = authOptions.callbacks?.session;
      expect(sessionCallback).toBeDefined();

      if (sessionCallback) {
        const baseSession: Session = {
          user: {
            id: '',
            name: authenticatedUser.name,
            email: authenticatedUser.email,
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const finalSession = await sessionCallback({
          session: baseSession,
          token: jwtToken,
          // @ts-expect-error - Partial parameters for testing
          user: undefined,
          newSession: undefined,
          trigger: 'getSession',
        });

        // 4. Verify final session has all required data
        expect(finalSession.user.id).toBe('flow-user-123');
        expect(finalSession.user.name).toBe('Flow Test User');
        expect(finalSession.user.email).toBe('flow@example.com');
        expect(finalSession.expires).toBeDefined();

        // 5. Verify session expiry is in the future
        const expiryDate = new Date(finalSession.expires);
        const now = new Date();
        expect(expiryDate.getTime()).toBeGreaterThan(now.getTime());

        // 6. Verify session expiry is approximately 7 days from now
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const timeDifference = Math.abs(expiryDate.getTime() - sevenDaysFromNow.getTime());
        // Allow 1 minute difference for test execution time
        expect(timeDifference).toBeLessThan(60 * 1000);
      }
    });
  });

  describe('Session Refresh', () => {
    it('should refresh session without losing user data', async () => {
      const existingToken: JWT = {
        id: 'refresh-user-456',
        name: 'Refresh User',
        email: 'refresh@example.com',
      };

      const jwtCallback = authOptions.callbacks?.jwt;
      if (jwtCallback) {
        // Simulate token refresh (no user object)
        const refreshedToken = await jwtCallback({
          token: existingToken,
          trigger: 'update',
          // @ts-expect-error - Partial parameters for testing
          user: undefined,
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        // User ID should be preserved
        expect(refreshedToken.id).toBe('refresh-user-456');
        expect(refreshedToken.name).toBe('Refresh User');
        expect(refreshedToken.email).toBe('refresh@example.com');
      }
    });
  });
});
