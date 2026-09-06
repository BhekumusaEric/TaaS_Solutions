import React from 'react';
import { cn } from '@/lib/utils';

export function Footer({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('border-t border-gray-200 bg-white py-8', className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-navy-500">TaaS Solutions</h2>
            <p className="text-sm text-gray-500">Turning Skills into Income</p>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <nav className="flex gap-4 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-teal-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-teal-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-teal-500 transition-colors">Contact</a>
            </nav>
            <p className="text-sm text-gray-400">
              © {currentYear} TaaS Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
