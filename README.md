# Private Markets Portfolio Tracker

A full-stack dashboard for modelling private-market investment commitments. It records investor positions and fund cash-flow schedules, then produces portfolio metrics, allocation views, and cumulative reports.

> All names, commitments, cash flows, and projections in this repository are mock data. This project is an independent portfolio project and is not affiliated with or endorsed by any investment manager.

## Features

- Create, edit, search, and delete investor records and fund products.
- Model commitments, primary investments, follow-ons, and secondary purchases.
- Track capital calls, distributions, and projected cash flows over time.
- Explore portfolio-level metrics and interactive charts.
- Generate per-investor fund and cumulative reports.
- Switch between light and dark themes.
- Sign in and sign up with Clerk, with dashboard routes protected for authenticated users.

## Tech Stack

- Next.js, React, and TypeScript
- Tailwind CSS and shadcn/ui
- Clerk for authentication
- MySQL or MariaDB via mysql2
- Recharts for visualizations
- Zod for server-side form validation

## Architecture

The Next.js App Router provides the dashboard routes and React Server Actions. Clerk middleware and the root `ClerkProvider` handle authentication, while `app/lib/actions.ts` requires an authenticated user before validating and persisting customer and product changes. `app/lib/sql.ts` owns database access and report calculations. UI components are organized by dashboard area under `app/ui`.

## Screenshots

## Local Setup

Requirements: Node.js 20+, pnpm, and MySQL or MariaDB.

```bash
pnpm install
cp .env.example .env.local
```

Set `DATABASE_URL` and your Clerk keys in `.env.local`:

```bash
DATABASE_URL=mysql://root:password@127.0.0.1:3306/private_markets_tracker
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

Create and seed the local database:

```bash
mysql -u root -p < private-markets-demo.sql
```

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:3000` in a browser.

## Quality Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## License

This project is available under the [MIT License](LICENSE).
