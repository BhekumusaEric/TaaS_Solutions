import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRole, assignPermissionToRole, assignRoleToUser, removeRoleFromUser } from './mutations';
import db from '@/lib/db';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';

vi.mock('@/lib/db', () => ({
  default: {
    role: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    permission: {
      findUnique: vi.fn(),
    },
    rolePermission: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    userRole: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Roles Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRole', () => {
    it('creates a new role', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue(null as any);
      vi.mocked(db.role.create).mockResolvedValue({
        id: 'new-role',
        name: 'Manager',
        description: 'M',
        createdAt: new Date(),
      } as any);

      const result = await createRole({ name: 'Manager', description: 'M' });

      expect(db.role.create).toHaveBeenCalled();
      expect(result.name).toBe('Manager');
    });

    it('throws ValidationError for invalid input', async () => {
      await expect(createRole({ name: 'A' })).rejects.toThrow(ValidationError);
      expect(db.role.create).not.toHaveBeenCalled();
    });

    it('throws ConflictError if role name already exists', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue({ id: 'existing' } as any);

      await expect(createRole({ name: 'Manager' })).rejects.toThrow(ConflictError);
      expect(db.role.create).not.toHaveBeenCalled();
    });
  });

  describe('assignPermissionToRole', () => {
    it('assigns permission to role', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue({ id: 'r1' } as any);
      vi.mocked(db.permission.findUnique).mockResolvedValue({ id: 'p1' } as any);
      vi.mocked(db.rolePermission.findUnique).mockResolvedValue(null as any);
      vi.mocked(db.rolePermission.create).mockResolvedValue({ id: 'rp1' } as any);

      await assignPermissionToRole('r1', 'p1');

      expect(db.rolePermission.create).toHaveBeenCalledWith({ data: { roleId: 'r1', permissionId: 'p1' } });
    });

    it('throws NotFoundError if role not found', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue(null as any);

      await expect(assignPermissionToRole('missing', 'p1')).rejects.toThrow(NotFoundError);
    });

    it('throws NotFoundError if permission not found', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue({ id: 'r1' } as any);
      vi.mocked(db.permission.findUnique).mockResolvedValue(null as any);

      await expect(assignPermissionToRole('r1', 'missing')).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError if already assigned', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue({ id: 'r1' } as any);
      vi.mocked(db.permission.findUnique).mockResolvedValue({ id: 'p1' } as any);
      vi.mocked(db.rolePermission.findUnique).mockResolvedValue({ id: 'rp1' } as any);

      await expect(assignPermissionToRole('r1', 'p1')).rejects.toThrow(ConflictError);
    });
  });

  describe('assignRoleToUser', () => {
    it('assigns role to user', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'u1' } as any);
      vi.mocked(db.role.findUnique).mockResolvedValue({ id: 'r1' } as any);
      vi.mocked(db.userRole.findUnique).mockResolvedValue(null as any);
      vi.mocked(db.userRole.create).mockResolvedValue({ id: 'ur1' } as any);

      await assignRoleToUser('u1', 'r1');

      expect(db.userRole.create).toHaveBeenCalledWith({ data: { userId: 'u1', roleId: 'r1' } });
    });

    it('throws ConflictError if user already has role', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'u1' } as any);
      vi.mocked(db.role.findUnique).mockResolvedValue({ id: 'r1' } as any);
      vi.mocked(db.userRole.findUnique).mockResolvedValue({ id: 'ur1' } as any);

      await expect(assignRoleToUser('u1', 'r1')).rejects.toThrow(ConflictError);
    });
  });

  describe('removeRoleFromUser', () => {
    it('removes role from user', async () => {
      vi.mocked(db.userRole.findUnique).mockResolvedValue({ id: 'ur1' } as any);

      await removeRoleFromUser('u1', 'r1');

      expect(db.userRole.delete).toHaveBeenCalledWith({ where: { id: 'ur1' } });
    });

    it('throws NotFoundError if assignment does not exist', async () => {
      vi.mocked(db.userRole.findUnique).mockResolvedValue(null as any);

      await expect(removeRoleFromUser('u1', 'r1')).rejects.toThrow(NotFoundError);
    });
  });
});
