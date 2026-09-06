'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import * as z from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export async function registerUser(values: RegisterValues) {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'A user with this email already exists' };
    }

    const hashedPassword = await hashPassword(password);

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      await tx.auditEvent.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          resourceType: 'User',
          resourceId: user.id,
          metadata: { email: user.email },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred during registration' };
  }
}
