import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrgDetailClient } from './org-detail-client';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const addOrganisationMemberMock = vi.fn();
const removeOrganisationMemberMock = vi.fn();

vi.mock('@/app/actions/organisation-members', () => ({
  addOrganisationMember: (...args: any[]) => addOrganisationMemberMock(...args),
  removeOrganisationMember: (...args: any[]) => removeOrganisationMemberMock(...args),
}));

describe('OrgDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an error when a duplicate member is added', async () => {
    addOrganisationMemberMock.mockResolvedValue({ error: 'User is already a member of this organisation' });

    render(
      <OrgDetailClient
        orgId="org-1"
        orgName="Demo Org"
        orgType="CLIENT"
        orgDescription="Test org"
        members={[]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /add member/i }));
    fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
      target: { value: 'someone@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add to organisation/i }));

    await waitFor(() => {
      expect(screen.getByText('User is already a member of this organisation')).toBeInTheDocument();
    });
  });

  it('shows an error when removing a user that is not a member', async () => {
    removeOrganisationMemberMock.mockResolvedValue({ error: 'User is not a member of this organisation' });

    render(
      <OrgDetailClient
        orgId="org-1"
        orgName="Demo Org"
        orgType="CLIENT"
        orgDescription="Test org"
        members={[
          {
            id: 'membership-1',
            userId: 'user-1',
            user: { id: 'user-1', name: 'Jane Doe', email: 'jane@example.com' },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /remove member/i }));

    await waitFor(() => {
      expect(screen.getByText('User is not a member of this organisation')).toBeInTheDocument();
    });
  });
});
