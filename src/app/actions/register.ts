'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { registerSchema, type RegisterValues } from '@/lib/auth-schemas';

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
