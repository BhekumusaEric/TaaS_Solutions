import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm } from 'react-hook-form';
import { FormField, FormItem } from './form-field';
import { FormLabel } from './form-label';
import { FormError } from './form-error';
import { Input } from '../ui/input';
import '@testing-library/jest-dom';

describe('Form Components', () => {
  const TestForm = ({ error = false }) => {
    const { control } = useForm({
      defaultValues: {
        username: ''
      }
    });

    return (
      <form>
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="username-input" error={error}>
                Username
              </FormLabel>
              <Input 
                id="username-input" 
                {...field} 
                error={error ? "Username is required" : undefined}
                aria-describedby={error ? "username-error" : undefined}
              />
              <FormError id="username-error">
                {error ? "Username is required" : null}
              </FormError>
            </FormItem>
          )}
        />
      </form>
    );
  };

  it('renders form field components successfully', () => {
    render(<TestForm />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays error and associates correctly', () => {
    render(<TestForm error={true} />);
    
    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'username-error');
    
    const errorMsg = screen.getAllByRole('alert')[0];
    expect(errorMsg).toHaveTextContent(/username is required/i);
  });
});
