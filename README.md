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

## Tech Stack

- Next.js, React, and TypeScript
- Tailwind CSS and shadcn/ui
- MySQL or MariaDB via mysql2
- Recharts for visualizations
- Zod for server-side form validation

## Architecture

The Next.js App Router provides the dashboard routes and React Server Actions. `app/lib/actions.ts` validates and persists customer and product changes. `app/lib/sql.ts` owns database access and report calculations. UI components are organized by dashboard area under `app/ui`.

## Screenshots

Run the application locally to view the dashboard. Add a screenshot or short GIF here before publishing a deployed portfolio version.

## Live Demo

No public demo is currently deployed. Before deploying, add authentication and use a separate database containing only the fictional seed data included in this repository.

## Local Setup

Requirements: Node.js 20+, pnpm, and MySQL or MariaDB.

```bash
pnpm install
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local`:

```bash
DATABASE_URL=mysql://root:password@127.0.0.1:3306/private_markets_tracker
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
