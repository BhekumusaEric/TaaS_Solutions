import db from '@/lib/db';
import { AuditEventWithUser, AuditEventFilter } from './types';
import { Prisma } from '@prisma/client';

export async function getAuditEvents(filter: AuditEventFilter = {}): Promise<AuditEventWithUser[]> {
  const where: Prisma.AuditEventWhereInput = {};

  if (filter.userId) where.userId = filter.userId;
  if (filter.action) where.action = filter.action;
  if (filter.resourceType) where.resourceType = filter.resourceType;
  if (filter.resourceId) where.resourceId = filter.resourceId;
  if (filter.organisationId) where.organisationId = filter.organisationId;
  
  if (filter.startDate || filter.endDate) {
    where.timestamp = {};
    if (filter.startDate) where.timestamp.gte = filter.startDate;
    if (filter.endDate) where.timestamp.lte = filter.endDate;
  }

  const take = filter.limit || 50;
  const skip = filter.offset || 0;

  const events = await db.auditEvent.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take,
    skip,
    include: {
      user: true,
    },
  });

  // Omit password from user objects
  return events.map(event => {
    const { password, ...userWithoutPassword } = event.user;
    return {
      ...event,
      user: userWithoutPassword,
    };
  });
}

export async function countAuditEvents(filter: AuditEventFilter = {}): Promise<number> {
  const where: Prisma.AuditEventWhereInput = {};

  if (filter.userId) where.userId = filter.userId;
  if (filter.action) where.action = filter.action;
  if (filter.resourceType) where.resourceType = filter.resourceType;
  if (filter.resourceId) where.resourceId = filter.resourceId;
  if (filter.organisationId) where.organisationId = filter.organisationId;
  
  if (filter.startDate || filter.endDate) {
    where.timestamp = {};
    if (filter.startDate) where.timestamp.gte = filter.startDate;
    if (filter.endDate) where.timestamp.lte = filter.endDate;
  }

  return db.auditEvent.count({ where });
}
