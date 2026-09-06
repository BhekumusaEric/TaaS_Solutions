import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuditEvents, countAuditEvents } from './queries';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    auditEvent: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Audit Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent = {
    id: 'evt-1',
    userId: 'u1',
    action: 'LOGIN',
    resourceType: 'Session',
    resourceId: 's1',
    timestamp: new Date(),
    user: {
      id: 'u1',
      password: 'hashed',
    }
  };

  describe('getAuditEvents', () => {
    it('returns filtered audit events without passwords', async () => {
      vi.mocked(db.auditEvent.findMany).mockResolvedValue([mockEvent] as any);

      const result = await getAuditEvents({ userId: 'u1' });

      expect(db.auditEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'u1' },
      }));
      expect(result).toHaveLength(1);
      expect(result[0].user).not.toHaveProperty('password');
    });

    it('filters by date range', async () => {
      vi.mocked(db.auditEvent.findMany).mockResolvedValue([] as any);

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      await getAuditEvents({ startDate, endDate });

      expect(db.auditEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        })
      }));
    });
  });

  describe('countAuditEvents', () => {
    it('returns the total count of filtered events', async () => {
      vi.mocked(db.auditEvent.count).mockResolvedValue(42);

      const result = await countAuditEvents({ action: 'LOGIN' });

      expect(db.auditEvent.count).toHaveBeenCalledWith({
        where: { action: 'LOGIN' }
      });
      expect(result).toBe(42);
    });
  });
});
