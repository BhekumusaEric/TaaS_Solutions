import db from '@/lib/db';
import { AuditEvent } from '@prisma/client';
import { CreateAuditInput } from './types';
import { NextRequest } from 'next/server';

export async function createAuditEvent(data: CreateAuditInput): Promise<AuditEvent> {
  return db.auditEvent.create({
    data: {
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      organisationId: data.organisationId,
      metadata: data.metadata || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    },
  });
}

/**
 * Helper to extract IP address and user agent from a Request/NextRequest
 */
export function extractRequestMetadata(req: Request): { ipAddress?: string; userAgent?: string } {
  let ipAddress: string | undefined;
  
  if ('ip' in req) {
    ipAddress = (req as any).ip; // NextRequest might have .ip
  }
  
  if (!ipAddress) {
    ipAddress = req.headers.get('x-forwarded-for') || undefined;
  }
  
  if (!ipAddress) {
    ipAddress = req.headers.get('x-real-ip') || undefined;
  }

  const userAgent = req.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}
