import React from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { SkipLinks } from './skip-links';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-light-grey font-sans text-dark-text">
      <SkipLinks />
      <Header />
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
