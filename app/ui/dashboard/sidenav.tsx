import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';

export default function SideNav() {
  return (
    <div
      suppressHydrationWarning={true}
      className="flex h-full flex-col border-r border-border/70 bg-secondary/40 px-3 py-4 backdrop-blur-sm md:px-2"
    >
      <Link
        className="mb-2 flex h-20 items-center justify-center rounded-xl bg-brand p-4 shadow-sm md:h-28 md:justify-start"
        href="/"
      >
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white md:text-base">
          Private Markets
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-xl bg-card/60 md:block"></div>
      </div>
    </div>
  );
}
