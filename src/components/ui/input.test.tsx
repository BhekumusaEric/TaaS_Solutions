import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { describe, it, expect } from 'vitest';
import { Input } from './input';
import '@testing-library/jest-dom';

expect.extend(matchers);

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('renders with label and connects id properly', () => {
    render(<Input label="Email Address" id="email" />);
    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
  });

  it('displays error message and sets aria attributes', () => {
    render(<Input label="Username" error="Username is required" />);
    const input = screen.getByLabelText(/username/i);
    const errorMessage = screen.getByText(/username is required/i);
    
    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
  });

  it('has no accessibility violations (basic)', async () => {
    const { container } = render(<Input label="Accessible Input" id="a11y-input" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with error', async () => {
    const { container } = render(<Input label="Error Input" id="err-input" error="Has error" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
