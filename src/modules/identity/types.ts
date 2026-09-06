import { User, Role } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface UserWithRoles extends UserWithoutPassword {
  roles: {
    role: Role;
  }[];
}
