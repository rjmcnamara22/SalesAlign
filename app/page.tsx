import Link from "next/link";

import { prisma } from "@/lib/database/prisma";
import { getComparableDate } from "@/lib/comparison/getComparableDate";

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
  const businessDate = getPreviousReportingDate();
  const comparableDate = getComparableDate(businessDate, 1);

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
      <section className="rounded-lg border p-8">
        <p className="text-sm text-gray-600">SalesAlign Dashboard</p>

        <h1 className="mt-3 text-4xl font-bold">
          Yesterday&apos;s Sales Overview
        </h1>

        <p className="mt-4 max-w-3xl text-gray-700">
          Track the most recent closed reporting day and compare it against the
          weekday-aligned historical sales record.
        </p>

        <p className="mt-3 text-sm text-gray-600">
          {dateFormatter.format(businessDate)} compared with{" "}
          {dateFormatter.format(comparableDate)}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sales"
            className="rounded bg-black px-4 py-2 font-medium text-white"
          >
            Enter sales
          </Link>
        </div>
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
            Weekday-aligned prior year
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
          <p className="mt-3 text-sm text-gray-600">
            Versus weekday-aligned prior year
          </p>
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
            Based on comparable day sales
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/calendar" className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <p className="mt-3 text-gray-700">
            View daily sales in a monthly calendar with multi-year weekday
            comparisons.
          </p>
        </Link>

        <Link href="/sales" className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Sales Entry</h2>
          <p className="mt-3 text-gray-700">
            Manually add and review daily sales records.
          </p>
        </Link>

        <Link href="/square-import" className="rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Square Import</h2>
          <p className="mt-3 text-gray-700">
            Import Square sales totals for individual days or date ranges.
          </p>
        </Link>
      </section>
    </main>
  );
}
