import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import ThemeToggle from '@/app/ui/theme/theme-toggle';

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
        <ThemeToggle />
        {/* <form>
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Cerrar sesión</div>
          </button>
        </form> */}{' '}
        {/* Hydration error */}
      </div>
    </div>
  );
}
