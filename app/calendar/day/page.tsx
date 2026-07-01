import Link from "next/link";
import { notFound } from "next/navigation";

import { getComparableDate } from "@/lib/comparison/getComparableDate";
import { prisma } from "@/lib/database/prisma";

type CalendarDayPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

function isValidDateString(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function parseBusinessDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCurrency(cents: number | null | undefined) {
  if (cents === null || cents === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDifference(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  const formattedValue = formatCurrency(Math.abs(cents));

  return cents >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export default async function CalendarDayPage({
  searchParams,
}: CalendarDayPageProps) {
  const params = await searchParams;

  if (!isValidDateString(params.date)) {
    notFound();
  }

  const businessDate = parseBusinessDate(params.date!);
  const comparableDate = getComparableDate(businessDate);

  const [currentRecord, comparableRecord] = await Promise.all([
    prisma.dailySales.findUnique({
      where: {
        businessDate,
      },
    }),

    prisma.dailySales.findUnique({
      where: {
        businessDate: comparableDate,
      },
    }),
  ]);

  const differenceCents =
    currentRecord && comparableRecord
      ? currentRecord.grossSalesCents - comparableRecord.grossSalesCents
      : null;

  const percentageChange =
    differenceCents !== null &&
    comparableRecord &&
    comparableRecord.grossSalesCents !== 0
      ? (differenceCents / comparableRecord.grossSalesCents) * 100
      : null;

  const calendarHref = `/calendar?year=${businessDate.getUTCFullYear()}&month=${
    businessDate.getUTCMonth() + 1
  }`;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link
        href={calendarHref}
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Back to calendar
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-500">Day detail</p>

        <h1 className="text-3xl font-bold">
          {formatDisplayDate(businessDate)}
        </h1>

        <p className="mt-2 text-gray-600">
          Compared with {formatDisplayDate(comparableDate)}.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Current sales</p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(currentRecord?.grossSalesCents)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {formatDate(businessDate)}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Comparable sales</p>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(comparableRecord?.grossSalesCents)}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {formatDate(comparableDate)}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Dollar difference</p>

          <p
            className={`mt-2 text-3xl font-bold ${
              differenceCents === null
                ? "text-gray-400"
                : differenceCents >= 0
                  ? "text-green-700"
                  : "text-red-700"
            }`}
          >
            {formatDifference(differenceCents)}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm font-medium text-gray-500">Percentage change</p>

          <p
            className={`mt-2 text-3xl font-bold ${
              percentageChange === null
                ? "text-gray-400"
                : percentageChange >= 0
                  ? "text-green-700"
                  : "text-red-700"
            }`}
          >
            {formatPercentage(percentageChange)}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Notes</h2>

        <p className="mt-3 text-gray-700">
          {currentRecord?.notes || "No notes for this day."}
        </p>
      </section>
    </main>
  );
}
