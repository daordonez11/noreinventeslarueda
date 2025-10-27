'use client';

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'No Reinventes la Rueda - Tech Library',
  description: 'Discover the best technology recommendations from the community',
  keywords: ['technology', 'libraries', 'recommendations', 'development'],
  openGraph: {
    title: 'No Reinventes la Rueda',
    description: 'Discover the best technology recommendations',
    type: 'website',
    url: 'https://noreinventeslarueda.dev',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}
