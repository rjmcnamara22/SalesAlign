# SalesAlign

SalesAlign is a full-stack sales comparison dashboard built for a small business that tracks daily sales performance against weekday-aligned historical records.

Instead of comparing the same exact calendar date year over year, SalesAlign compares each reporting day against the equivalent weekday from previous years. This gives a more accurate view of performance for businesses where sales vary heavily by day of the week, such as restaurants, bars, and other hospitality businesses.

## Live Demo

[View SalesAlign on Vercel](https://sales-align.vercel.app)

## Overview

Many small businesses compare daily sales against prior years using printed calendars or spreadsheets. For hospitality businesses, exact-date comparisons can be misleading because Fridays, Saturdays, holidays, and event days often produce very different sales patterns than weekdays.

SalesAlign digitizes this workflow by importing Square sales data, storing daily totals in a PostgreSQL database, and displaying weekday-aligned comparisons through a dashboard and monthly calendar.

## Features

- Imports daily sales totals from the Square Reporting API
- Stores sales records in a PostgreSQL database using Prisma
- Compares sales against weekday-aligned historical dates using 52-week intervals
- Displays yesterday's sales overview with prior-year comparison
- Provides a monthly calendar view with historical comparison data
- Supports manual sales entry and correction through protected admin pages
- Includes protected Square import tools for single-day or range-based imports
- Uses a public read-only dashboard for recruiters or non-admin viewers
- Includes admin authentication for import, edit, and delete actions
- Runs scheduled imports through Vercel Cron

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes and server actions
- **Database:** PostgreSQL with Prisma ORM
- **Hosting:** Vercel
- **Database Hosting:** Neon
- **External API:** Square Reporting API
- **Authentication:** Custom admin session authentication
- **Automation:** Vercel Cron Jobs

## Core Business Logic

SalesAlign uses weekday-aligned comparisons instead of exact-date comparisons.

For example, instead of comparing:

```text
Tuesday, June 30, 2026
to
Monday, June 30, 2025
```

SalesAlign compares:

```text
Tuesday, June 30, 2026
to
Tuesday, July 1, 2025
```

This is done by subtracting 364 days, or 52 weeks, from the current reporting date.

```ts
const DAYS_IN_52_WEEKS = 364;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getComparableDate(currentDate: Date, yearsBack = 1): Date {
  return new Date(
    currentDate.getTime() -
      DAYS_IN_52_WEEKS * yearsBack * MILLISECONDS_PER_DAY,
  );
}
```

## Sales Data Calculation

The main sales total is calculated from Square reporting data as:

```text
Sales total = Net sales + Sales tax
```

This better matches the business owner's preferred reporting workflow.

## Main Pages

### Dashboard

The dashboard shows the previous reporting day's sales total, comparable historical sales total, dollar difference, and percentage change.

### Sales Calendar

The calendar page shows daily sales totals in a month view and compares each day to weekday-aligned historical dates.

### Daily Sales

Admin-only page for manually adding, reviewing, and correcting daily sales records.

### Square Import

Admin-only page for importing Square sales records by selected date range.

## Environment Variables

The project requires the following environment variables:

```env
DATABASE_URL=
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_ENVIRONMENT=
BUSINESS_TIMEZONE=
CRON_SECRET=
ADMIN_PASSWORD=
ADMIN_AUTH_SECRET=
```

Do not commit `.env` or `.env.local` files.

## Getting Started

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## Useful Commands

Run linting:

```bash
npm run lint
```

Build the project:

```bash
npm run build
```

Open Prisma Studio:

```bash
npx prisma studio
```

## Project Status

SalesAlign is deployed and functional with real Square sales data integration, protected admin tools, scheduled imports, and a public read-only dashboard.

Future improvements may include:

- Last import status display
- Missing-data indicators on the calendar
- Month-to-date comparison summaries
- More detailed trend analytics
- Mobile manager dashboard integration
