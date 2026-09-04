/**
 * Authentication Utilities Tests
 *
 * Tests for helper functions used in authentication and authorization.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSession,
  requireAuth,
  isAuth,
  getCurrentUserId,
  requireUserId,
  isResourceOwner,
  requireResourceOwnership,
  getAuthSession,
} from './auth-utils';
import { UnauthorizedError, ForbiddenError } from './errors';
import type { Session } from 'next-auth';

// Mock next-auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock auth config
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Import mocked function
import { getServerSession } from 'next-auth/next';

describe('Authentication Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSession', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const session = await getSession();

      expect(session).toEqual(mockSession);
      expect(getServerSession).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const session = await requireAuth();

      expect(session).toEqual(mockSession);
    });

    it('should throw UnauthorizedError when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });

    it('should throw UnauthorizedError when session has no user', async () => {
      const mockSession = {
        user: null,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } as any;

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('isAuth', () => {
    it('should return true when user is authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const authenticated = await isAuth();

      expect(authenticated).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const authenticated = await isAuth();

      expect(authenticated).toBe(false);
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user ID when authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const userId = await getCurrentUserId();

      expect(userId).toBe('user-123');
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const userId = await getCurrentUserId();

      expect(userId).toBeNull();
    });
  });

  describe('requireUserId', () => {
    it('should return user ID when authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-456',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const userId = await requireUserId();

      expect(userId).toBe('user-456');
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(requireUserId()).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('isResourceOwner', () => {
    it('should return true when user owns the resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const isOwner = await isResourceOwner('user-123');

      expect(isOwner).toBe(true);
    });

    it('should return false when user does not own the resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const isOwner = await isResourceOwner('user-456');

      expect(isOwner).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const isOwner = await isResourceOwner('user-123');

      expect(isOwner).toBe(false);
    });
  });

  describe('requireResourceOwnership', () => {
    it('should not throw when user owns the resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      await expect(requireResourceOwnership('user-123')).resolves.not.toThrow();
    });

    it('should throw ForbiddenError when user does not own the resource', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      await expect(requireResourceOwnership('user-456')).rejects.toThrow(ForbiddenError);
    });

    it('should use custom error message when provided', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const customMessage = 'You can only edit your own opportunities';

      await expect(requireResourceOwnership('user-456', customMessage)).rejects.toThrow(
        customMessage
      );
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(requireResourceOwnership('user-123')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('getAuthSession', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession: Session = {
        user: {
          id: 'user-789',
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const session = await getAuthSession();

      expect(session).toEqual(mockSession);
      expect(getServerSession).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const session = await getAuthSession();

      expect(session).toBeNull();
    });
  });
});
