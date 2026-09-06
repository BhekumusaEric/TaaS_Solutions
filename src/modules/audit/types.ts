import { AuditEvent, User } from '@prisma/client';
import { UserWithoutPassword } from '@/modules/identity/types';

export interface AuditEventWithUser extends AuditEvent {
  user: UserWithoutPassword;
}

export interface CreateAuditInput {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  organisationId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEventFilter {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  organisationId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}
