/**
 * Prisma Type Exports and Utilities
 * 
 * This file re-exports commonly used Prisma types and provides
 * utility type definitions for the application.
 * 
 * NOTE: This file will cause TypeScript errors until Prisma Client
 * is generated. Run `npx prisma generate` first.
 */

// Re-export PrismaClient for convenience
export { PrismaClient } from '@prisma/client';

// Re-export all generated types
export type {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Organisation,
  OrganisationMember,
  AuditEvent,
  Account,
  Session,
  VerificationToken,
} from '@prisma/client';

// Re-export enums
export { OrganisationType } from '@prisma/client';

// Utility type: User with roles included
export type UserWithRoles = {
  id: string;
  email: string;
  name: string;
  roles: Array<{
    role: {
      id: string;
      name: string;
      description: string | null;
    };
  }>;
};

// Utility type: User with organisations
export type UserWithOrganisations = {
  id: string;
  email: string;
  name: string;
  organisationMembers: Array<{
    organisation: {
      id: string;
      name: string;
      type: string;
    };
  }>;
};

// Utility type: Role with permissions
export type RoleWithPermissions = {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    permission: {
      id: string;
      name: string;
      resource: string;
      action: string;
    };
  }>;
};

// Utility type: Organisation with members
export type OrganisationWithMembers = {
  id: string;
  name: string;
  type: string;
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

/**
 * Type guard to check if a value is a valid OrganisationType
 */
export function isValidOrganisationType(value: unknown): value is OrganisationType {
  return value === 'CLIENT' || value === 'PARTNER';
}

/**
 * Helper type for Prisma where clauses with organisation filtering
 */
export type OrganisationFilteredWhere<T> = T & {
  organisationId?: {
    in: string[];
  };
};
