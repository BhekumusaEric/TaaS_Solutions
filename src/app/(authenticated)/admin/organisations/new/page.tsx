'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem } from '@/components/forms/form-field';
import { FormLabel } from '@/components/forms/form-label';
import { AppShell } from '@/components/layouts/app-shell';
import { ArrowLeft } from 'lucide-react';
import { createOrganisation, type CreateOrganisationValues } from '@/app/actions/organisations';

const orgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  type: z.enum(['CLIENT', 'PARTNER'], { required_error: 'Please select a type' }),
  description: z.string().max(500).optional(),
});

export default function NewOrganisationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<CreateOrganisationValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      type: 'CLIENT',
      description: '',
    },
  });

  const onSubmit = async (values: CreateOrganisationValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrganisation(values);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push('/admin/organisations');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-2xl">
        <Link href="/admin/organisations" className="inline-flex items-center text-sm text-gray-500 hover:text-navy-500 transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to organisations
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-navy-500">Create Organisation</CardTitle>
            <CardDescription>Add a new client or partner organisation to the platform.</CardDescription>
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
                    <FormLabel htmlFor="name" error={!!errors.name}>Organisation Name</FormLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Acme Corporation"
                      error={errors.name?.message}
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="type" error={!!errors.type}>Type</FormLabel>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:border-transparent"
                      {...field}
                    >
                      <option value="CLIENT">Client</option>
                      <option value="PARTNER">Partner</option>
                    </select>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description (optional)</FormLabel>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Brief description of the organisation..."
                      className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:border-transparent resize-none"
                      {...field}
                    />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={isLoading}>
                  Create Organisation
                </Button>
                <Link href="/admin/organisations">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
