import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserDetailClient } from './user-detail-client';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const assignRoleMock = vi.fn();
const removeRoleMock = vi.fn();

vi.mock('@/app/actions/user-roles', () => ({
  assignRole: (...args: any[]) => assignRoleMock(...args),
  removeRole: (...args: any[]) => removeRoleMock(...args),
}));

describe('UserDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an error when a duplicate role assignment is attempted', async () => {
    assignRoleMock.mockResolvedValue({ error: 'User already has this role' });

    render(
      <UserDetailClient
        userId="user-1"
        userName="Jane Doe"
        userEmail="jane@example.com"
        userRoles={[
          {
            id: 'ur-1',
            roleId: 'role-1',
            role: {
              id: 'role-1',
              name: 'Viewer',
              description: 'Read-only access',
              permissions: [],
            },
          },
        ]}
        allRoles={[
          { id: 'role-1', name: 'Viewer', description: 'Read-only access' },
          { id: 'role-2', name: 'Editor', description: 'Can edit' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open role form/i }));
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Editor' },
    });
    fireEvent.click(screen.getByRole('button', { name: /assign role/i }));

    await waitFor(() => {
      expect(screen.getByText('User already has this role')).toBeInTheDocument();
    });
  });

  it('shows an error when removing a role that the user does not have', async () => {
    removeRoleMock.mockResolvedValue({ error: 'User does not have this role' });

    render(
      <UserDetailClient
        userId="user-1"
        userName="Jane Doe"
        userEmail="jane@example.com"
        userRoles={[
          {
            id: 'ur-1',
            roleId: 'role-1',
            role: {
              id: 'role-1',
              name: 'Viewer',
              description: 'Read-only access',
              permissions: [],
            },
          },
        ]}
        allRoles={[
          { id: 'role-1', name: 'Viewer', description: 'Read-only access' },
          { id: 'role-2', name: 'Editor', description: 'Can edit' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /remove role viewer/i }));

    await waitFor(() => {
      expect(screen.getByText('User does not have this role')).toBeInTheDocument();
    });
  });
});
