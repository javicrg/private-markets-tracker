'use client';

import {
  HomeIcon,
  ChartBarIcon,
  WalletIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  { name: 'Clientes', href: '/dashboard/customers', icon: WalletIcon },
  { name: 'Productos', href: '/dashboard/products', icon: ChartBarIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-xl bg-card/70 p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-brand/15 hover:text-brand md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-brand/15 text-brand shadow-sm': pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
