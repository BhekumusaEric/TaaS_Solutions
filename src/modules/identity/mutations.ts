import db from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { CreateUserInput, UpdateUserInput, createUserSchema, updateUserSchema } from './schema';
import { UserWithoutPassword } from './types';
import { excludePassword } from './queries';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';

export async function createUser(data: CreateUserInput): Promise<UserWithoutPassword> {
  // Validate input
  const validatedData = createUserSchema.safeParse(data);
  if (!validatedData.success) {
    const firstIssue = validatedData.error.issues[0];
    const field = firstIssue?.path[0]?.toString() || 'input';
    throw new ValidationError('Invalid user data', field);
  }

  const { email, name, password } = validatedData.data;

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return excludePassword(user);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<UserWithoutPassword> {
  // Validate input
  const validatedData = updateUserSchema.safeParse(data);
  if (!validatedData.success) {
    const firstIssue = validatedData.error.issues[0];
    const field = firstIssue?.path[0]?.toString() || 'input';
    throw new ValidationError('Invalid update data', field);
  }

  // Check if user exists
  const existingUser = await db.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new NotFoundError('User not found');
  }

  // Update user (email is intentionally omitted from the update schema to prevent changes)
  const updatedUser = await db.user.update({
    where: { id },
    data: validatedData.data,
  });

  return excludePassword(updatedUser);
}
