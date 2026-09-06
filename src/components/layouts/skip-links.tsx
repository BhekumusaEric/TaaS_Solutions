import React from 'react';

export function SkipLinks() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-navy-500 focus:font-bold focus:shadow-md"
    >
      Skip to main content
    </a>
  );
}
