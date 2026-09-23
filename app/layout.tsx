import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';

import { Toaster } from '@/app/ui/shadcn/ui/toaster';
import ThemeScript from '@/app/ui/theme/theme-script';

export const metadata: Metadata = {
  title: {
    template: '%s | Private Markets Tracker',
    default: 'Private Markets Portfolio Tracker',
  },
  description: 'A portfolio tracker for private-market investment commitments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased transition-colors">
        <ClerkProvider localization={esES}>{children}</ClerkProvider>{' '}
        <Toaster />
      </body>
    </html>
  );
}
