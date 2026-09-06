'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem } from '@/components/forms/form-field';
import { FormLabel } from '@/components/forms/form-label';
import { requestPasswordReset } from '@/app/actions/password-reset';
import { CheckCircle } from 'lucide-react';

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type RequestResetValues = z.infer<typeof requestResetSchema>;

export default function ResetPasswordRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: RequestResetValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(values);
      if (result.error) {
        setError(result.error);
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-teal-100 p-3">
                <CheckCircle className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-navy-500">Check your email</h2>
              <p className="text-sm text-gray-500">
                If an account exists with that email address, we&apos;ve sent a password reset link.
                The link will expire in 1 hour.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/sign-in" className="text-sm font-medium text-teal-500 hover:text-teal-600 transition-colors">
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-navy-500">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3" role="alert">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email" error={!!errors.email}>Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...field}
                  />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send reset link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link href="/auth/sign-in" className="font-medium text-teal-500 hover:text-teal-600 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
