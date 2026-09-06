'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import * as z from 'zod';

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleName: z.string().min(1, 'Role name is required'),
});

const removeRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

async function verifyAdmin(adminId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: adminId },
    include: { roles: { include: { role: true } } },
  });
  return user?.roles.some((ur) => ur.role.name === 'PLATFORM_ADMIN') ?? false;
}

export async function assignRole(values: z.infer<typeof assignRoleSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'Not authenticated' };
  if (!(await verifyAdmin(session.user.id))) return { error: 'Insufficient permissions' };

  const validated = assignRoleSchema.safeParse(values);
  if (!validated.success) return { error: 'Invalid input' };

  const { userId, roleName } = validated.data;

  try {
    const role = await db.role.findUnique({ where: { name: roleName } });
    if (!role) return { error: 'Role not found' };

    const existing = await db.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: role.id } },
    });
    if (existing) return { error: 'User already has this role' };

    await db.$transaction(async (tx) => {
      await tx.userRole.create({
        data: { userId, roleId: role.id },
      });

      await tx.auditEvent.create({
        data: {
          userId: session.user.id,
          action: 'ROLE_ASSIGNED',
          resourceType: 'UserRole',
          resourceId: userId,
          metadata: { targetUserId: userId, roleName },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function removeRole(values: z.infer<typeof removeRoleSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'Not authenticated' };
  if (!(await verifyAdmin(session.user.id))) return { error: 'Insufficient permissions' };

  const validated = removeRoleSchema.safeParse(values);
  if (!validated.success) return { error: 'Invalid input' };

  const { userId, roleId } = validated.data;

  try {
    const userRole = await db.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
      include: { role: true },
    });
    if (!userRole) return { error: 'User does not have this role' };

    await db.$transaction(async (tx) => {
      await tx.userRole.delete({
        where: { id: userRole.id },
      });

      await tx.auditEvent.create({
        data: {
          userId: session.user.id,
          action: 'ROLE_REMOVED',
          resourceType: 'UserRole',
          resourceId: userId,
          metadata: { targetUserId: userId, roleName: userRole.role.name },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
