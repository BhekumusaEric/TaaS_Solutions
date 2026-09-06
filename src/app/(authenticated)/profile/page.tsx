'use client';

import React, { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem } from '@/components/forms/form-field';
import { FormLabel } from '@/components/forms/form-label';
import { updateProfile, type UpdateProfileValues } from '@/app/actions/update-profile';
import { AppShell } from '@/components/layouts/app-shell';
import { CheckCircle, User } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, formState: { errors } } = useForm<UpdateProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
    },
  });

  const onSubmit = async (values: UpdateProfileValues) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await updateProfile(values);
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          setSuccess(true);
          // Update the session to reflect the new name
          await updateSession({ name: values.name });
          // Auto-clear success after 3 seconds
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch {
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  if (!session?.user) {
    return null;
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-500">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account settings.</p>
        </div>

        {/* Profile Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
                <User className="h-8 w-8 text-navy-700" />
              </div>
              <div>
                <CardTitle className="text-xl">{session.user.name}</CardTitle>
                <CardDescription>{session.user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Name Card */}
        <Card>
          <CardHeader>
            <CardTitle>Update Name</CardTitle>
            <CardDescription>Change your display name. Your email cannot be changed.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3" role="alert">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-teal-50 p-3 flex items-center gap-2" role="status">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <p className="text-sm font-medium text-teal-800">Profile updated successfully.</p>
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
                      autoComplete="name"
                      error={errors.name?.message}
                      {...field}
                    />
                  </FormItem>
                )}
              />

              {/* Email (read-only) */}
              <div className="space-y-2">
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={session.user.email ?? ''}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400">Email address cannot be changed.</p>
              </div>

              <Button type="submit" isLoading={isPending}>
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
