import { Organisation, OrganisationMember, User } from '@prisma/client';
import { UserWithoutPassword } from '@/modules/identity/types';

export interface OrganisationWithMembers extends Organisation {
  members: {
    user: UserWithoutPassword;
    id: string;
    createdAt: Date;
  }[];
}

export interface UserWithOrganisations extends UserWithoutPassword {
  organisationMembers: {
    organisation: Organisation;
  }[];
}
