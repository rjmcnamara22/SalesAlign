import Link from "next/link";

import { prisma } from "@/lib/database/prisma";
import { getComparableDate } from "@/lib/comparison/getComparableDate";

import { isAdminSession } from "@/lib/auth/admin";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

import { getLatestCompletedReportingDate } from "@/lib/reporting/getLatestCompletedReportingDate";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

const latestSquareRecord = await prisma.dailySales.findFirst({
  where: {
    source: "SQUARE",
  },
  orderBy: {
    businessDate: "desc",
  },
  select: {
    businessDate: true,
    updatedAt: true,
  },
});

const latestCompletedReportingDateKey = getLatestCompletedReportingDate();

const latestImportedDateKey = latestSquareRecord
  ? latestSquareRecord.businessDate.toISOString().slice(0, 10)
  : null;

const isDataCurrent =
  latestImportedDateKey !== null &&
  latestImportedDateKey >= latestCompletedReportingDateKey;

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateOnly(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function getEasternDateKey(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function subtractDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() - days);
  return nextDate;
}

function getPreviousReportingDate() {
  const now = new Date();

  return parseDateOnly(getEasternDateKey(subtractDays(now, 1)));
}

export default async function Home() {
  const isAdmin = await isAdminSession();

  const businessDate = getPreviousReportingDate();
  const comparableDate = getComparableDate(businessDate, 1);
  const comparableYear = comparableDate.getUTCFullYear();

  const records = await prisma.dailySales.findMany({
    where: {
      businessDate: {
        in: [businessDate, comparableDate],
      },
    },
  });

  const salesByDate = new Map(
    records.map((record) => [formatDateKey(record.businessDate), record]),
  );

  const currentRecord = salesByDate.get(formatDateKey(businessDate));
  const comparableRecord = salesByDate.get(formatDateKey(comparableDate));

  const currentSalesCents = currentRecord?.salesTotalCents ?? 0;
  const comparableSalesCents = comparableRecord?.salesTotalCents ?? 0;

  const differenceCents = currentSalesCents - comparableSalesCents;

  const percentageChange =
    comparableSalesCents > 0
      ? (differenceCents / comparableSalesCents) * 100
      : null;

  const isDifferenceNegative = differenceCents < 0;

  return (
    <main className="mx-auto max-w-7xl p-8">
      {!isAdmin ? (
        <section className="mb-8 rounded-lg border p-8">
          <p className="text-sm text-gray-600">Project Overview</p>

          <h1 className="mt-3 text-4xl font-bold">SalesAlign</h1>

          <p className="mt-4 max-w-4xl text-gray-700">
            SalesAlign is a full-stack sales comparison dashboard built for a
            small business that tracks daily performance against weekday-aligned
            historical sales. Instead of comparing the same exact calendar date
            year over year, the app compares each reporting day against the
            equivalent weekday from previous years, which better reflects
            restaurant and bar sales patterns.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded border p-4">
              <h2 className="font-bold">Business Problem</h2>
              <p className="mt-2 text-sm text-gray-700">
                Sales vary heavily by weekday, so comparing a Friday to a Monday
                can give owners a misleading view of performance. This app
                digitizes a manual calendar-based comparison workflow.
              </p>
            </div>

            <div className="rounded border p-4">
              <h2 className="font-bold">Technical Solution</h2>
              <p className="mt-2 text-sm text-gray-700">
                The app imports Square sales totals, stores historical records
                in a database, calculates weekday-aligned comparison dates, and
                exposes a read-only dashboard while protecting all admin-only
                actions.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
            <div>
              <span className="font-semibold text-gray-900">Frontend:</span>{" "}
              Next.js, React, TypeScript, Tailwind CSS
            </div>

            <div>
              <span className="font-semibold text-gray-900">Backend:</span>{" "}
              Next.js server actions, API routes, Prisma
            </div>

            <div>
              <span className="font-semibold text-gray-900">Database:</span>{" "}
              PostgreSQL (Hosted on Neon)
            </div>

            <div>
              <span className="font-semibold text-gray-900">Integrations:</span>{" "}
              Square Reporting API, Vercel Cron
            </div>
          </div>
        </section>
      ) : null}
      <section className="rounded-lg border p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">SalesAlign Dashboard</p>

            <h1 className="mt-3 text-4xl font-bold">
              Yesterday&apos;s Sales Overview
            </h1>
          </div>

          {isAdmin ? (
            <AdminLogoutButton />
          ) : (
            <Link
              href="/admin/login?redirectTo=/"
              className="rounded border px-4 py-2 font-medium"
            >
              Login
            </Link>
          )}
        </div>

        <p className="mt-4 max-w-3xl text-gray-700">
          Track the most recent closed reporting day and compare it against the
          weekday-aligned historical sales record.
        </p>

        <p className="mt-3 text-sm text-gray-600">
          {dateFormatter.format(businessDate)} compared with{" "}
          {dateFormatter.format(comparableDate)}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Yesterday&apos;s sales total</p>
          <p className="mt-3 text-3xl font-bold">
            {formatCurrency(currentSalesCents)}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {currentRecord ? "Imported from Square" : "No record imported yet"}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Comparable day sales</p>
          <p className="mt-3 text-3xl font-bold">
            {formatCurrency(comparableSalesCents)}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Sales from {comparableYear}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Difference</p>
          <p
            className={`mt-3 text-3xl font-bold ${
              isDifferenceNegative ? "text-red-600" : "text-green-700"
            }`}
          >
            {formatCurrency(differenceCents)}
          </p>
          <p className="mt-3 text-sm text-gray-600">Versus {comparableYear}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Percentage change</p>
          <p
            className={`mt-3 text-3xl font-bold ${
              isDifferenceNegative ? "text-red-600" : "text-green-700"
            }`}
          >
            {percentageChange === null
              ? "N/A"
              : `${percentageChange.toFixed(1)}%`}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Based on {comparableYear}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Data status</h2>

            <p className="mt-2 text-gray-600">
              Tracks whether the latest completed Square reporting day has been
              imported.
            </p>
          </div>

          <span
            className={`rounded px-3 py-1 text-sm font-medium ${
              isDataCurrent
                ? "bg-green-50 text-green-700"
                : "bg-yellow-50 text-yellow-700"
            }`}
          >
            {isDataCurrent ? "Current" : "Update needed"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-600">
              Latest imported reporting day
            </p>
            <p className="mt-1 font-semibold">
              {latestSquareRecord
                ? dateFormatter.format(latestSquareRecord.businessDate)
                : "No Square imports found"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              Expected latest reporting day
            </p>
            <p className="mt-1 font-semibold">
              {dateFormatter.format(
                new Date(`${latestCompletedReportingDateKey}T00:00:00.000Z`),
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Last updated</p>
            <p className="mt-1 font-semibold">
              {latestSquareRecord
                ? dateTimeFormatter.format(latestSquareRecord.updatedAt)
                : "N/A"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/calendar" className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="mt-3 text-gray-700">
            View the daily sales in a monthly calendar that displays weekday
            comparisons.
          </p>
        </Link>

        <Link href="/sales" className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Sales Entry</h2>
          <p className="mt-3 text-gray-700">
            Admin-only tools for manually reviewing, adding, or editing daily
            sales records.
          </p>
        </Link>

        <Link href="/square-import" className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Square Import</h2>
          <p className="mt-3 text-gray-700">
            Admin-only tools for importing Square sales totals by date range.
          </p>
        </Link>
      </section>
    </main>
  );
}
