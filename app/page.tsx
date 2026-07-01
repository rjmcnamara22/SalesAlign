import Link from "next/link";

import { getMonthCalendarDays } from "@/lib/calendar/getMonthCalendarDays";
import { getComparableDate } from "@/lib/comparison/getComparableDate";
import { prisma } from "@/lib/database/prisma";

const YEARS_BACK = 1;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatCurrency(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getComparisonTextColor(value: number | null) {
  if (value === null) {
    return "text-gray-400";
  }

  return value >= 0 ? "text-green-700" : "text-red-700";
}

export default async function HomePage() {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();

  const calendarDays = getMonthCalendarDays(year, monthIndex);
  const currentMonthDays = calendarDays.filter((day) => day.isCurrentMonth);

  const monthStartDate = currentMonthDays[0].date;
  const monthEndDate = currentMonthDays[currentMonthDays.length - 1].date;

  const comparableStartDate = getComparableDate(monthStartDate, YEARS_BACK);
  const queryEndDate = addDays(monthEndDate, 1);

  const salesRecords = await prisma.dailySales.findMany({
    where: {
      businessDate: {
        gte: comparableStartDate,
        lt: queryEndDate,
      },
    },
    select: {
      businessDate: true,
      grossSalesCents: true,
    },
  });

  const salesByDate = new Map(
    salesRecords.map((record) => [formatDateKey(record.businessDate), record]),
  );

  let currentMonthSalesCents = 0;
  let comparableMonthSalesCents = 0;
  let currentMonthRecordCount = 0;
  let comparableRecordCount = 0;

  for (const day of currentMonthDays) {
    const currentRecord = salesByDate.get(formatDateKey(day.date));
    const comparableDate = getComparableDate(day.date, YEARS_BACK);
    const comparableRecord = salesByDate.get(formatDateKey(comparableDate));

    if (currentRecord) {
      currentMonthSalesCents += currentRecord.grossSalesCents;
      currentMonthRecordCount += 1;
    }

    if (comparableRecord) {
      comparableMonthSalesCents += comparableRecord.grossSalesCents;
      comparableRecordCount += 1;
    }
  }

  const differenceCents =
    currentMonthRecordCount > 0 && comparableRecordCount > 0
      ? currentMonthSalesCents - comparableMonthSalesCents
      : null;

  const percentageChange =
    differenceCents !== null && comparableMonthSalesCents !== 0
      ? (differenceCents / comparableMonthSalesCents) * 100
      : null;

  const monthName = MONTH_NAMES[monthIndex];

  return (
    <main className="mx-auto max-w-7xl p-8">
      <section className="rounded-xl border bg-white p-8">
        <p className="text-sm font-medium text-gray-500">
          SalesAlign Dashboard
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {monthName} {year} Sales Overview
        </h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Track daily sales and compare each business date against
          weekday-aligned historical sales records.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/calendar?year=${year}&month=${monthIndex + 1}`}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white"
          >
            View calendar
          </Link>

          <Link
            href="/sales"
            className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Enter sales
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">
            Current month sales
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(currentMonthSalesCents)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {currentMonthRecordCount} recorded day
            {currentMonthRecordCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Comparable sales</p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(
              comparableRecordCount > 0 ? comparableMonthSalesCents : null,
            )}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {comparableRecordCount} comparable day
            {comparableRecordCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Dollar difference</p>

          <p
            className={`mt-2 text-3xl font-bold ${getComparisonTextColor(
              differenceCents,
            )}`}
          >
            {differenceCents === null
              ? "—"
              : `${differenceCents >= 0 ? "+" : "-"}${formatCurrency(
                  Math.abs(differenceCents),
                )}`}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Versus weekday-aligned prior year
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Percentage change</p>

          <p
            className={`mt-2 text-3xl font-bold ${getComparisonTextColor(
              percentageChange,
            )}`}
          >
            {formatPercentage(percentageChange)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Based on recorded comparable days
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href={`/calendar?year=${year}&month=${monthIndex + 1}`}
          className="rounded-lg border p-6 transition hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold">Calendar</h2>
          <p className="mt-2 text-sm text-gray-600">
            View daily sales in a monthly calendar with multi-year weekday
            comparisons.
          </p>
        </Link>

        <Link
          href="/sales"
          className="rounded-lg border p-6 transition hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold">Sales Entry</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manually add and review daily sales records.
          </p>
        </Link>

        <div className="rounded-lg border p-6 text-gray-400">
          <h2 className="text-xl font-semibold">Square Import</h2>
          <p className="mt-2 text-sm">
            Coming next: import daily sales totals directly from Square.
          </p>
        </div>
      </section>
    </main>
  );
}
