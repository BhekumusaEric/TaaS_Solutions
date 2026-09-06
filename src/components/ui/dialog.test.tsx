import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { describe, it, expect } from 'vitest';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog';
import '@testing-library/jest-dom';

expect.extend(matchers);

describe('Dialog Component', () => {
  const TestDialog = () => (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>This is a test dialog</DialogDescription>
        </DialogHeader>
        <button>Inside Button</button>
      </DialogContent>
    </Dialog>
  );

  it('opens and closes the dialog', async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    const trigger = screen.getByText('Open Dialog');
    await user.click(trigger);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes dialog on Escape key', async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    
    await user.click(screen.getByText('Open Dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('has no accessibility violations when open', async () => {
    render(<TestDialog />);
    const user = userEvent.setup();
    
    await user.click(screen.getByText('Open Dialog'));
    
    // Since Dialog uses portals to document.body, we check body
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
