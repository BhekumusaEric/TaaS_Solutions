import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserById, getUserByEmail, getUserWithRoles } from './queries';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Identity Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('getUserById', () => {
    it('returns user without password when user exists', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await getUserById('user-1');

      expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe(mockUser.email);
    });

    it('returns null when user does not exist', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null as any);

      const result = await getUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('returns user without password when user exists', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await getUserByEmail('test@example.com');

      expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password');
    });

    it('returns null when user does not exist', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null as any);

      const result = await getUserByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getUserWithRoles', () => {
    it('returns user with roles and without password when user exists', async () => {
      const mockUserWithRoles = {
        ...mockUser,
        roles: [
          {
            role: {
              id: 'role-1',
              name: 'Admin',
              description: 'Administrator',
              createdAt: new Date(),
            }
          }
        ]
      };
      vi.mocked(db.user.findUnique).mockResolvedValue(mockUserWithRoles as any);

      const result = await getUserWithRoles('user-1');

      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('password');
      expect(result?.roles).toHaveLength(1);
      expect(result?.roles[0].role.name).toBe('Admin');
    });

    it('returns null when user does not exist', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null as any);

      const result = await getUserWithRoles('non-existent');

      expect(result).toBeNull();
    });
  });
});
