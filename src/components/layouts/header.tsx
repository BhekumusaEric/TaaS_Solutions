'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, User } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Avatar from '@radix-ui/react-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className={cn('sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm', className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-navy-500 tracking-tight">TaaS Solutions</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-600 hover:text-teal-500 transition-colors">Dashboard</Link>
            <Link href="/projects" className="text-gray-600 hover:text-teal-500 transition-colors">Projects</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {status === 'authenticated' && session?.user ? (
            <div className="hidden md:flex items-center gap-4">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-gray-200 p-1 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
                    <Avatar.Root className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100">
                      <Avatar.Fallback className="text-sm font-semibold text-navy-700">
                        {session.user.name?.charAt(0) || <User className="h-4 w-4" />}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <span className="sr-only">Toggle user menu</span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" className="w-56 mt-2 z-50 rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80 slide-in-from-top-1">
                    <div className="px-2 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-dark-text truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <DropdownMenu.Item className="flex cursor-pointer items-center rounded-sm px-2 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 hover:text-dark-text focus:bg-gray-100 focus:text-dark-text" onSelect={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="outline" className="border-navy-500 text-navy-500 hover:bg-navy-50">Sign In</Button>
              </Link>
            </div>
          )}

          <button 
            className="md:hidden text-gray-600 hover:text-navy-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 rounded-sm p-1"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 shadow-inner">
          <nav className="flex flex-col space-y-4 text-sm font-medium">
            <Link href="/dashboard" className="text-gray-600 hover:text-teal-500">Dashboard</Link>
            <Link href="/projects" className="text-gray-600 hover:text-teal-500">Projects</Link>
            
            {status === 'authenticated' && session?.user ? (
              <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100">
                    <span className="font-semibold text-navy-700">{session.user.name?.charAt(0) || <User className="h-5 w-5" />}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark-text">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="pt-4 mt-2 border-t border-gray-100">
                <Link href="/auth/signin" className="block w-full">
                  <Button className="w-full bg-navy-500 text-white hover:bg-navy-600">Sign In</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
