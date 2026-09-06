import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, updateUser } from './mutations';
import { hashPassword } from '@/lib/password';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}));

describe('Identity Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validCreateData = {
    email: 'newuser@example.com',
    name: 'New User',
    password: 'SecurePassword123!',
  };

  const validUpdateData = {
    name: 'Updated Name',
  };

  describe('createUser', () => {
    it('creates a user with hashed password when data is valid', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null as any);
      vi.mocked(db.user.create).mockResolvedValue({
        id: 'new-user-id',
        email: validCreateData.email,
        name: validCreateData.name,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createUser(validCreateData);

      expect(db.user.findUnique).toHaveBeenCalledWith({ where: { email: validCreateData.email } });
      expect(hashPassword).toHaveBeenCalledWith(validCreateData.password);
      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          email: validCreateData.email,
          name: validCreateData.name,
          password: 'hashed_password',
        }
      });
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(validCreateData.email);
    });

    it('throws ValidationError when input is invalid', async () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'A', // too short
        password: 'weak',
      };

      await expect(createUser(invalidData)).rejects.toThrow(ValidationError);
      expect(db.user.create).not.toHaveBeenCalled();
    });

    it('throws ConflictError when email is already registered', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'existing-id' } as any);

      await expect(createUser(validCreateData)).rejects.toThrow(ConflictError);
      expect(db.user.create).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('updates allowed fields when data is valid', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'user-1' } as any);
      vi.mocked(db.user.update).mockResolvedValue({
        id: 'user-1',
        email: 'existing@example.com',
        name: validUpdateData.name,
        password: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await updateUser('user-1', validUpdateData);

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: validUpdateData,
      });
      expect(result.name).toBe(validUpdateData.name);
      expect(result).not.toHaveProperty('password');
    });

    it('throws ValidationError when input is invalid', async () => {
      const invalidData = {
        name: 'A', // too short
      };

      await expect(updateUser('user-1', invalidData)).rejects.toThrow(ValidationError);
      expect(db.user.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when user is not found', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null as any);

      await expect(updateUser('non-existent', validUpdateData)).rejects.toThrow(NotFoundError);
      expect(db.user.update).not.toHaveBeenCalled();
    });
    
    it('prevents email changes via update user schema', async () => {
      // TypeScript compiler prevents passing email if we respect the types, 
      // but if we bypass it, zod should strip or throw
      const bypassData = { name: 'New Name', email: 'changed@example.com' } as any;
      
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'user-1' } as any);
      vi.mocked(db.user.update).mockResolvedValue({
        id: 'user-1',
        email: 'original@example.com',
        name: 'New Name',
        password: 'pwd',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      
      await updateUser('user-1', bypassData);
      
      // zod.object().strip (default behavior) removes unrecognized keys.
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { name: 'New Name' }, // email should be stripped
      });
    });
  });
});
