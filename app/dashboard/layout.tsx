import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import SideNav from '../ui/dashboard/sidenav';
import ThemeToggle from '../ui/theme/theme-toggle';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    redirect('/sign-in');
  }
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex flex-grow flex-col p-6 md:overflow-y-auto md:p-12">
        <header className="mb-6 flex items-center justify-end gap-3 md:mb-8">
          <ThemeToggle />
          <UserButton />
        </header>
        {children}
      </div>
    </div>
  );
}
