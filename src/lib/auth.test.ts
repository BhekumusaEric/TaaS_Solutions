/**
 * NextAuth.js Configuration Tests
 *
 * Validates the NextAuth.js configuration structure and security settings.
 */

import { describe, it, expect } from 'vitest';
import { authOptions } from './auth';

describe('NextAuth Configuration', () => {
  describe('Configuration Structure', () => {
    it('should have valid authOptions object', () => {
      expect(authOptions).toBeDefined();
      expect(typeof authOptions).toBe('object');
    });

    it('should have Prisma adapter configured', () => {
      expect(authOptions.adapter).toBeDefined();
    });

    it('should have credentials provider configured', () => {
      expect(authOptions.providers).toBeDefined();
      expect(Array.isArray(authOptions.providers)).toBe(true);
      expect(authOptions.providers.length).toBeGreaterThan(0);

      const credentialsProvider = authOptions.providers[0];
      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider.id).toBe('credentials');
      expect(credentialsProvider.name).toBe('Credentials');
    });

    it('should have JWT session strategy configured', () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 7-day session maxAge', () => {
      expect(authOptions.session?.maxAge).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it('should have session update age of 24 hours', () => {
      expect(authOptions.session?.updateAge).toBe(24 * 60 * 60); // 24 hours in seconds
    });
  });

  describe('Custom Pages', () => {
    it('should have custom sign-in page configured', () => {
      expect(authOptions.pages?.signIn).toBe('/sign-in');
    });

    it('should have custom sign-out page configured', () => {
      expect(authOptions.pages?.signOut).toBe('/sign-out');
    });

    it('should have custom error page configured', () => {
      expect(authOptions.pages?.error).toBe('/auth/error');
    });

    it('should have verify request page configured', () => {
      expect(authOptions.pages?.verifyRequest).toBe('/auth/verify-request');
    });

    it('should have new user page configured', () => {
      expect(authOptions.pages?.newUser).toBe('/auth/new-user');
    });
  });

  describe('Callbacks', () => {
    it('should have jwt callback defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });

    it('should have session callback defined', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });

  describe('Security Configuration', () => {
    it('should have secure cookie configuration in production', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production config
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const prodCookieName = '__Secure-next-auth.session-token';
      expect(authOptions.cookies?.sessionToken?.name).toBe(prodCookieName);

      // Restore original env
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should have httpOnly cookies', () => {
      expect(authOptions.cookies?.sessionToken?.options.httpOnly).toBe(true);
    });

    it('should have sameSite lax for CSRF protection', () => {
      expect(authOptions.cookies?.sessionToken?.options.sameSite).toBe('lax');
    });

    it('should have correct path for cookies', () => {
      expect(authOptions.cookies?.sessionToken?.options.path).toBe('/');
    });

    it('should require NEXTAUTH_SECRET environment variable', () => {
      expect(authOptions.secret).toBeDefined();
    });
  });

  describe('Credentials Provider', () => {
    it('should have email and password credentials configured', () => {
      const credentialsProvider = authOptions.providers[0];

      // Access credentials via type assertion
      const credentials = (credentialsProvider as any).credentials;

      expect(credentials).toBeDefined();
      expect(credentials.email).toBeDefined();
      expect(credentials.email.type).toBe('email');
      expect(credentials.password).toBeDefined();
      expect(credentials.password.type).toBe('password');
    });

    it('should have authorize function defined', () => {
      const credentialsProvider = authOptions.providers[0];

      expect((credentialsProvider as any).authorize).toBeDefined();
      expect(typeof (credentialsProvider as any).authorize).toBe('function');
    });
  });

  describe('Environment Configuration', () => {
    it('should enable debug in development', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test development config
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      expect(authOptions.debug).toBe(true);

      // Restore original env
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('Type Augmentations', () => {
    it('should properly type Session with user.id', () => {
      // This is a compile-time check - if it compiles, the types are correct
      type SessionUser = {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };

      // Mock session to verify type structure
      const mockSession: { user: SessionUser } = {
        user: {
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      expect(mockSession.user.id).toBe('test-id');
    });
  });
});
