'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem } from '@/components/forms/form-field';
import { FormLabel } from '@/components/forms/form-label';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser, registerSchema, type RegisterValues } from '@/app/actions/register';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await registerUser(values);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        // Redirect to sign-in page with success message
        router.push('/auth/sign-in?registered=true');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-navy-500">Create an account</CardTitle>
          <CardDescription>
            Enter your details to register for TaaS Solutions
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name" error={!!errors.name}>Full Name</FormLabel>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    autoComplete="name"
                    error={errors.name?.message}
                    {...field} 
                  />
                </FormItem>
              )}
            />

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
            
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password" error={!!errors.password}>Password</FormLabel>
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
            
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Register
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="font-medium text-teal-500 hover:text-teal-600 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
