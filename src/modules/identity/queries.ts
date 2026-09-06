import db from '@/lib/db';
import { UserWithoutPassword, UserWithRoles } from './types';

export function excludePassword<T extends { password?: string | null }>(user: T): Omit<T, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) return null;
  return excludePassword(user);
}

export async function getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) return null;
  return excludePassword(user);
}

export async function getUserWithRoles(id: string): Promise<UserWithRoles | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) return null;
  return excludePassword(user) as UserWithRoles;
}
