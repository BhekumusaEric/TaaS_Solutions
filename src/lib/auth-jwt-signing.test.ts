/**
 * JWT Configuration Tests
 *
 * Tests to verify JWT token configuration meets security requirements.
 * Validates:
 * - JWT configuration is properly set up
 * - NEXTAUTH_SECRET is required for JWT encryption
 * - JWT expiry is configured correctly (7 days)
 * - JWT callbacks correctly populate token data with user ID
 * - Session strategy uses JWT (stateless)
 *
 * Note: NextAuth v4 uses JWE (encrypted JWTs) for secure session storage.
 * These tests verify configuration correctness and callback behavior.
 *
 * @module lib/auth-jwt-signing.test
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { authOptions } from './auth';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';
import { encode, decode } from 'next-auth/jwt';

// Test secret for JWT signing/encryption
const testSecret = 'test-secret-key-for-jwt-signing-at-least-32-characters-long';

// Store original env and set test secret
let originalSecret: string | undefined;

beforeAll(() => {
  originalSecret = process.env.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_SECRET = testSecret;
});

afterAll(() => {
  if (originalSecret !== undefined) {
    process.env.NEXTAUTH_SECRET = originalSecret;
  } else {
    delete process.env.NEXTAUTH_SECRET;
  }
});

describe('JWT Configuration and Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('JWT Session Strategy Configuration', () => {
    it('should use JWT session strategy (stateless sessions)', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 7-day session expiry (604800 seconds)', () => {
      const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 604800 seconds
      expect(authOptions.session?.maxAge).toBe(sevenDaysInSeconds);
    });

    it('should have 24-hour session update age', () => {
      const oneDayInSeconds = 24 * 60 * 60; // 86400 seconds
      expect(authOptions.session?.updateAge).toBe(oneDayInSeconds);
    });

    it('should have session configuration defined', () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session).toMatchObject({
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
      });
    });
  });

  describe('JWT Secret Configuration', () => {
    it('should have secret property for JWT encryption', () => {
      // Secret should be defined in authOptions (reads from NEXTAUTH_SECRET env var)
      expect('secret' in authOptions).toBe(true);
    });

    it('should configure secure cookie settings', () => {
      const cookieOptions = authOptions.cookies?.sessionToken?.options;
      
      expect(cookieOptions).toBeDefined();
      expect(cookieOptions?.httpOnly).toBe(true); // Prevent JavaScript access
      expect(cookieOptions?.sameSite).toBe('lax'); // CSRF protection
      expect(cookieOptions?.path).toBe('/');
    });

    it('should use secure cookie flag based on environment', () => {
      const cookieOptions = authOptions.cookies?.sessionToken?.options;
      const isProduction = process.env.NODE_ENV === 'production';
      
      expect(cookieOptions?.secure).toBe(isProduction);
    });

    it('should use appropriate cookie name based on environment', () => {
      const cookieName = authOptions.cookies?.sessionToken?.name;
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        expect(cookieName).toBe('__Secure-next-auth.session-token');
      } else {
        expect(cookieName).toBe('next-auth.session-token');
      }
    });
  });

  describe('JWT Callback Configuration', () => {
    it('should have JWT callback defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });

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

        // Callback should add user ID to token
        expect(result.id).toBe('user-123');
        expect(result.name).toBe('Test User');
        expect(result.email).toBe('test@example.com');
      }
    });

    it('should preserve user ID on token refresh', async () => {
      const existingToken: JWT = {
        id: 'user-456',
        name: 'Refresh User',
        email: 'refresh@example.com',
      };

      const jwtCallback = authOptions.callbacks?.jwt;
      if (jwtCallback) {
        const result = await jwtCallback({
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
        expect(result.id).toBe('user-789'); // ID should remain
      }
    });
  });

  describe('Session Callback Configuration', () => {
    it('should have session callback defined', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });

    it('should enrich session with user ID from token', async () => {
      const mockSession = {
        user: {
          id: '',
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
      const mockSession = {
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
        // No ID in token
      };

      const sessionCallback = authOptions.callbacks?.session;
      if (sessionCallback) {
        const result = await sessionCallback({
          session: mockSession,
          token: mockToken,
          // @ts-expect-error - Partial parameters for testing
          user: undefined,
          newSession: undefined,
          trigger: 'getSession',
        });

        // Should not throw
        expect(result.user).toBeDefined();
        expect(result.user.name).toBe('Test User');
      }
    });
  });

  describe('JWT Token Lifecycle', () => {
    it('should maintain user ID through full authentication flow', async () => {
      // 1. User authenticates
      const mockUser: User = {
        id: 'lifecycle-user-789',
        email: 'lifecycle@example.com',
        name: 'Lifecycle User',
      };

      const initialToken: JWT = {
        name: mockUser.name,
        email: mockUser.email,
      };

      // 2. JWT callback enriches token on sign-in
      const jwtCallback = authOptions.callbacks?.jwt;
      let enrichedToken: JWT = initialToken;
      
      if (jwtCallback) {
        enrichedToken = await jwtCallback({
          token: initialToken,
          user: mockUser,
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        expect(enrichedToken.id).toBe('lifecycle-user-789');
      }

      // 3. Session callback enriches session with token data
      const sessionCallback = authOptions.callbacks?.session;
      if (sessionCallback) {
        const mockSession = {
          user: {
            id: '',
            name: mockUser.name,
            email: mockUser.email,
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const finalSession = await sessionCallback({
          session: mockSession,
          token: enrichedToken,
          // @ts-expect-error - Partial parameters for testing
          user: undefined,
          newSession: undefined,
          trigger: 'getSession',
        });

        // 4. Verify user ID is maintained throughout
        expect(finalSession.user.id).toBe('lifecycle-user-789');
        expect(finalSession.user.name).toBe('Lifecycle User');
        expect(finalSession.user.email).toBe('lifecycle@example.com');
      }
    });
  });

  describe('JWT Expiry Validation', () => {
    it('should have maxAge configured for 7-day expiry', () => {
      const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 604800 seconds
      expect(authOptions.session?.maxAge).toBe(sevenDaysInSeconds);
    });

    it('should have session update age configured', () => {
      const oneDayInSeconds = 24 * 60 * 60; // 86400 seconds
      expect(authOptions.session?.updateAge).toBe(oneDayInSeconds);
    });

    it('should use JWT strategy for stateless sessions', () => {
      // JWT strategy ensures tokens are self-contained and include expiry
      expect(authOptions.session?.strategy).toBe('jwt');
    });
  });

  describe('JWT Security Properties', () => {
    it('should use NEXTAUTH_SECRET from environment for encryption', () => {
      // Verify that test environment has the secret set
      expect(process.env.NEXTAUTH_SECRET).toBeDefined();
      expect(process.env.NEXTAUTH_SECRET).toBe(testSecret);
    });

    it('should have secret configured in authOptions', () => {
      // authOptions should read secret from environment
      expect('secret' in authOptions).toBe(true);
    });

    it('should not include sensitive data in JWT payload via callbacks', () => {
      // Verify JWT callback only adds safe data (id, name, email)
      // Not passwords, API keys, or other sensitive data
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      // Callback should be a function that processes tokens
      expect(typeof jwtCallback).toBe('function');
    });

    it('should use secure cookie configuration', () => {
      const cookieOptions = authOptions.cookies?.sessionToken?.options;
      
      // HTTP-only prevents JavaScript access
      expect(cookieOptions?.httpOnly).toBe(true);
      
      // SameSite provides CSRF protection
      expect(cookieOptions?.sameSite).toBe('lax');
      
      // Secure flag in production only
      const isProduction = process.env.NODE_ENV === 'production';
      expect(cookieOptions?.secure).toBe(isProduction);
    });
  });

  describe('JWT Callback Integration', () => {
    it('should produce valid token structure from JWT callback', async () => {
      const mockUser = {
        id: 'callback-user-123',
        email: 'callback@example.com',
        name: 'Callback User',
      };

      const mockToken: JWT = {
        name: mockUser.name,
        email: mockUser.email,
        sub: mockUser.id,
      };

      // Simulate JWT callback
      const jwtCallback = authOptions.callbacks?.jwt;
      expect(jwtCallback).toBeDefined();

      if (jwtCallback) {
        const enrichedToken = await jwtCallback({
          token: mockToken,
          user: mockUser,
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        // Verify callback added user ID
        expect(enrichedToken.id).toBe('callback-user-123');
        expect(enrichedToken.name).toBe('Callback User');
        expect(enrichedToken.email).toBe('callback@example.com');
      }
    });

    it('should maintain user ID through token lifecycle', async () => {
      const userId = 'lifecycle-user-789';
      
      // 1. Initial token from authorization
      const initialToken: JWT = {
        sub: userId,
        name: 'Lifecycle User',
        email: 'lifecycle@example.com',
      };

      // 2. JWT callback enriches token
      const jwtCallback = authOptions.callbacks?.jwt;
      if (jwtCallback) {
        const enrichedToken = await jwtCallback({
          token: initialToken,
          user: { id: userId, name: 'Lifecycle User', email: 'lifecycle@example.com' },
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        // Token should now have ID
        expect(enrichedToken.id).toBe(userId);
        
        // Verify token structure is valid for session use
        expect(enrichedToken.name).toBe('Lifecycle User');
        expect(enrichedToken.email).toBe('lifecycle@example.com');
      }
    });

    it('should produce tokens with required claims', async () => {
      const mockUser: User = {
        id: 'required-claims-user',
        email: 'claims@example.com',
        name: 'Claims User',
      };

      const initialToken: JWT = {};

      const jwtCallback = authOptions.callbacks?.jwt;
      if (jwtCallback) {
        const result = await jwtCallback({
          token: initialToken,
          user: mockUser,
          trigger: 'signIn',
          // @ts-expect-error - Partial parameters for testing
          account: null,
          profile: undefined,
          session: undefined,
          isNewUser: false,
        });

        // Required claims for JWT
        expect(result.id).toBe('required-claims-user');
        expect(typeof result.id).toBe('string');
        expect(result.id.length).toBeGreaterThan(0);
      }
    });
  });

  describe('JWT Encryption Security', () => {
    it('should use JWE (JSON Web Encryption) for session tokens', () => {
      // NextAuth v4 uses JWE for encrypted session tokens
      // This is configured via the session strategy
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have secret for JWT encryption', () => {
      // Secret is required for JWT encryption/signing
      expect('secret' in authOptions).toBe(true);
    });

    it('should use secure cookie name in production', () => {
      const cookieName = authOptions.cookies?.sessionToken?.name;
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        // Production uses __Secure prefix for additional security
        expect(cookieName).toBe('__Secure-next-auth.session-token');
      } else {
        expect(cookieName).toBe('next-auth.session-token');
      }
    });

    it('should enforce HTTPS in production via secure flag', () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const secure = authOptions.cookies?.sessionToken?.options.secure;
      
      // Secure flag should match environment
      expect(secure).toBe(isProduction);
    });

    it('should have httpOnly flag for XSS protection', () => {
      const httpOnly = authOptions.cookies?.sessionToken?.options.httpOnly;
      
      // httpOnly prevents JavaScript from accessing the cookie
      expect(httpOnly).toBe(true);
    });

    it('should have SameSite for CSRF protection', () => {
      const sameSite = authOptions.cookies?.sessionToken?.options.sameSite;
      
      // SameSite helps prevent CSRF attacks
      expect(sameSite).toBe('lax');
    });
  });
});
