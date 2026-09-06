'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem } from '@/components/forms/form-field';
import { FormLabel } from '@/components/forms/form-label';
import { resetPassword } from '@/app/actions/password-reset';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export default function ResetPasswordCompletePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: NewPasswordValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword({ token, password: values.password });

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setIsSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-teal-100 p-3">
                <CheckCircle className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-navy-500">Password updated</h2>
              <p className="text-sm text-gray-500">
                Your password has been successfully reset. All existing sessions have been signed out for security.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/auth/sign-in">
              <Button className="bg-navy-500 text-white hover:bg-navy-600">Sign in with new password</Button>
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
          <CardTitle className="text-2xl font-bold tracking-tight text-navy-500">Set new password</CardTitle>
          <CardDescription>
            Enter your new password below
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password" error={!!errors.password}>New Password</FormLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      error={errors.password?.message}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword" error={!!errors.confirmPassword}>Confirm Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    {...field}
                  />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset password
            </Button>
          </form>
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
