import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'TaaS Solutions - Talent as a Service',
  description: 'Youth-powered ICT solutions. Governed for real-world delivery.',
};

import { Providers } from '@/components/providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
