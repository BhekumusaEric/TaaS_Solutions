'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import * as z from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export async function updateProfile(values: UpdateProfileValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const validated = updateProfileSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { name } = validated.data;

  try {
    await db.$transaction(async (tx) => {
      const previousUser = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { name },
      });

      await tx.auditEvent.create({
        data: {
          userId: session.user.id,
          action: 'PROFILE_UPDATED',
          resourceType: 'User',
          resourceId: session.user.id,
          metadata: {
            previousName: previousUser?.name,
            newName: name,
          },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
