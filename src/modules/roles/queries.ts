import db from '@/lib/db';
import { RoleWithPermissions } from './types';
import { Role, Permission } from '@prisma/client';

export async function getRoles(): Promise<Role[]> {
  return db.role.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getRoleById(id: string): Promise<Role | null> {
  return db.role.findUnique({
    where: { id },
  });
}

export async function getRoleWithPermissions(id: string): Promise<RoleWithPermissions | null> {
  return db.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function getPermissions(): Promise<Permission[]> {
  return db.permission.findMany({
    orderBy: [
      { resource: 'asc' },
      { action: 'asc' },
    ],
  });
}

export async function getPermissionsByRole(roleId: string): Promise<Permission[]> {
  const rolePermissions = await db.rolePermission.findMany({
    where: { roleId },
    include: {
      permission: true,
    },
  });
  return rolePermissions.map(rp => rp.permission);
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const userRoles = await db.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const permissions = userRoles.flatMap(ur => 
    ur.role.permissions.map(rp => rp.permission)
  );

  // Remove duplicates based on ID
  const uniquePermissions = Array.from(
    new Map(permissions.map(p => [p.id, p])).values()
  );

  return uniquePermissions;
}
