import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogPage from './page';

const mockSession = { user: { id: 'admin-1' } };

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => mockSession),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Admin User', email: 'admin@example.com' } },
    status: 'authenticated',
  }),
  signOut: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

const dbUserFindUnique = vi.fn();
const dbAuditEventFindMany = vi.fn();
const dbAuditEventCount = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: (...args: any[]) => dbUserFindUnique(...args) },
    auditEvent: {
      findMany: (...args: any[]) => dbAuditEventFindMany(...args),
      count: (...args: any[]) => dbAuditEventCount(...args),
    },
  },
}));

describe('AuditLogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    dbUserFindUnique.mockResolvedValue({
      roles: [{ role: { name: 'PLATFORM_ADMIN' } }],
    });

    dbAuditEventFindMany.mockResolvedValue([
      {
        id: 'event-1',
        timestamp: new Date('2025-01-01T12:00:00Z'),
        userId: 'user-1',
        action: 'ROLE_ASSIGNED',
        resourceType: 'UserRole',
        resourceId: 'role-1',
        organisationId: null,
        metadata: { roleName: 'Viewer' },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        user: { id: 'user-1', email: 'admin@example.com', name: 'Admin User', password: null },
      },
    ]);

    dbAuditEventCount.mockResolvedValue(1);
  });

  it('renders audit log rows for platform admins', async () => {
    const page = await AuditLogPage({
      searchParams: Promise.resolve({}),
    });

    render(page);

    expect(screen.getByText('Audit Log')).toBeInTheDocument();
    expect(screen.getByText('ROLE_ASSIGNED')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('UserRole')).toBeInTheDocument();
  });
});
