import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    // Generate an ID if one wasn't provided, to link label and input
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-medium leading-none text-dark-text peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-dark-text placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-500 font-medium mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
