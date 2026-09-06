import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRoles, getRoleById, getRoleWithPermissions, getPermissions, getPermissionsByRole } from './queries';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    role: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    permission: {
      findMany: vi.fn(),
    },
    rolePermission: {
      findMany: vi.fn(),
    },
  },
}));

describe('Roles Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRole = {
    id: 'role-1',
    name: 'Admin',
    description: 'Administrator role',
    createdAt: new Date(),
  };

  const mockPermission = {
    id: 'perm-1',
    name: 'user:read',
    resource: 'user',
    action: 'read',
    createdAt: new Date(),
  };

  describe('getRoles', () => {
    it('returns all roles ordered by name', async () => {
      vi.mocked(db.role.findMany).mockResolvedValue([mockRole] as any);

      const result = await getRoles();

      expect(db.role.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Admin');
    });
  });

  describe('getRoleById', () => {
    it('returns a role by id', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue(mockRole as any);

      const result = await getRoleById('role-1');

      expect(db.role.findUnique).toHaveBeenCalledWith({ where: { id: 'role-1' } });
      expect(result?.id).toBe('role-1');
    });

    it('returns null if role not found', async () => {
      vi.mocked(db.role.findUnique).mockResolvedValue(null as any);
      
      const result = await getRoleById('missing');
      
      expect(result).toBeNull();
    });
  });

  describe('getRoleWithPermissions', () => {
    it('returns role with associated permissions', async () => {
      const mockRoleWithPerms = {
        ...mockRole,
        permissions: [
          { permission: mockPermission }
        ]
      };
      
      vi.mocked(db.role.findUnique).mockResolvedValue(mockRoleWithPerms as any);

      const result = await getRoleWithPermissions('role-1');

      expect(db.role.findUnique).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        include: { permissions: { include: { permission: true } } }
      });
      expect(result?.permissions[0].permission.name).toBe('user:read');
    });
  });

  describe('getPermissions', () => {
    it('returns all permissions ordered by resource and action', async () => {
      vi.mocked(db.permission.findMany).mockResolvedValue([mockPermission] as any);
      
      const result = await getPermissions();
      
      expect(db.permission.findMany).toHaveBeenCalledWith({
        orderBy: [{ resource: 'asc' }, { action: 'asc' }]
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getPermissionsByRole', () => {
    it('returns permissions associated with a specific role', async () => {
      vi.mocked(db.rolePermission.findMany).mockResolvedValue([
        { permission: mockPermission }
      ] as any);
      
      const result = await getPermissionsByRole('role-1');
      
      expect(db.rolePermission.findMany).toHaveBeenCalledWith({
        where: { roleId: 'role-1' },
        include: { permission: true }
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('user:read');
    });
  });
});
