import db from '@/lib/db';
import { Role, RolePermission, UserRole } from '@prisma/client';
import { CreateRoleInput, createRoleSchema } from './schema';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';

export async function createRole(data: CreateRoleInput): Promise<Role> {
  const validatedData = createRoleSchema.safeParse(data);
  if (!validatedData.success) {
    const firstIssue = validatedData.error.issues[0];
    const field = firstIssue?.path[0]?.toString() || 'input';
    throw new ValidationError('Invalid role data', field);
  }

  const { name, description } = validatedData.data;

  const existingRole = await db.role.findUnique({ where: { name } });
  if (existingRole) {
    throw new ConflictError('Role with this name already exists');
  }

  return db.role.create({
    data: {
      name,
      description,
    },
  });
}

export async function assignPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
  const role = await db.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new NotFoundError('Role not found');
  }

  const permission = await db.permission.findUnique({ where: { id: permissionId } });
  if (!permission) {
    throw new NotFoundError('Permission not found');
  }

  const existingAssignment = await db.rolePermission.findUnique({
    where: {
      roleId_permissionId: { roleId, permissionId },
    },
  });

  if (existingAssignment) {
    throw new ConflictError('Permission already assigned to role');
  }

  return db.rolePermission.create({
    data: {
      roleId,
      permissionId,
    },
  });
}

export async function assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const role = await db.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new NotFoundError('Role not found');
  }

  const existingAssignment = await db.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId },
    },
  });

  if (existingAssignment) {
    throw new ConflictError('User already has this role');
  }

  return db.userRole.create({
    data: {
      userId,
      roleId,
    },
  });
}

export async function removeRoleFromUser(userId: string, roleId: string): Promise<void> {
  const existingAssignment = await db.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId },
    },
  });

  if (!existingAssignment) {
    throw new NotFoundError('User does not have this role');
  }

  await db.userRole.delete({
    where: {
      id: existingAssignment.id,
    },
  });
}
