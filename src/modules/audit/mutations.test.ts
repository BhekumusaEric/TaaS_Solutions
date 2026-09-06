import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuditEvent, extractRequestMetadata } from './mutations';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

describe('Audit Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuditEvent', () => {
    it('creates an audit event with metadata', async () => {
      const mockEvent = {
        userId: 'u1',
        action: 'LOGIN',
        resourceType: 'Session',
        resourceId: 's1',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      };
      
      vi.mocked(db.auditEvent.create).mockResolvedValue({ id: 'evt-1', ...mockEvent } as any);

      const result = await createAuditEvent(mockEvent);

      expect(db.auditEvent.create).toHaveBeenCalledWith({
        data: {
          ...mockEvent,
          organisationId: undefined,
          metadata: null,
        }
      });
      expect(result.id).toBe('evt-1');
    });
  });

  describe('extractRequestMetadata', () => {
    it('extracts metadata from request headers', () => {
      const mockReq = {
        headers: new Map([
          ['x-forwarded-for', '192.168.1.1'],
          ['user-agent', 'Mozilla'],
        ])
      } as any;
      
      const result = extractRequestMetadata(mockReq);
      
      expect(result.ipAddress).toBe('192.168.1.1');
      expect(result.userAgent).toBe('Mozilla');
    });
  });
});
