'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Users } from 'lucide-react';
import { addOrganisationMember, removeOrganisationMember } from '@/app/actions/organisation-members';

interface Member {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
}

interface OrgDetailClientProps {
  orgId: string;
  orgName: string;
  orgType: string;
  orgDescription: string | null;
  members: Member[];
}

export function OrgDetailClient({ orgId, orgName, orgType, orgDescription, members }: OrgDetailClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddMember = async () => {
    setError(null);
    startTransition(async () => {
      const result = await addOrganisationMember({ organisationId: orgId, email });
      if (result.error) {
        setError(result.error);
      } else {
        setEmail('');
        setDialogOpen(false);
        router.refresh();
      }
    });
  };

  const handleRemoveMember = async (userId: string) => {
    startTransition(async () => {
      await removeOrganisationMember({ organisationId: orgId, userId });
      router.refresh();
    });
  };

  return (
    <>
      {/* Org Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-navy-500">{orgName}</CardTitle>
              <CardDescription>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 ${
                  orgType === 'CLIENT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {orgType}
                </span>
              </CardDescription>
            </div>
          </div>
          {orgDescription && <p className="text-sm text-gray-500 mt-2">{orgDescription}</p>}
        </CardHeader>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-500" />
              Members ({members.length})
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-teal-500 text-white hover:bg-teal-600">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {error && (
                    <div className="rounded-md bg-red-50 p-3" role="alert">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  )}
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleAddMember} isLoading={isPending} className="w-full">
                    Add to Organisation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No members yet. Add users to this organisation.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-dark-text">{member.user.name}</p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
