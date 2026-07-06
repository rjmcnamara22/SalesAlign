import Link from "next/link";

import { DailySalesCreateForDateForm } from "@/components/DailySalesCreateForDateForm";
import { DailySalesDeleteForm } from "@/components/DailySalesDeleteForm";
import { DailySalesEditForm } from "@/components/DailySalesEditForm";
import { prisma } from "@/lib/database/prisma";
import { getComparableDate } from "@/lib/comparison/getComparableDate";
import { isAdminSession } from "@/lib/auth/admin";

type DayPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

const YEARS_BACK = 8;

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

function parseBusinessDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function isValidDateString(value: string | undefined): value is string {
  return value !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return `${value.toFixed(1)}%`;
}

export default async function CalendarDayPage({ searchParams }: DayPageProps) {
  const params = await searchParams;
  const businessDateKey = params.date;

  if (!isValidDateString(businessDateKey)) {
    return (
      <main className="mx-auto max-w-5xl p-8">
        <h1 className="text-3xl font-bold">Invalid date</h1>

        <p className="mt-4 text-gray-600">
          Please select a valid calendar date.
        </p>

        <Link href="/calendar" className="mt-6 inline-block underline">
          Back to calendar
        </Link>
      </main>
    );
  }

  const isAdmin = await isAdminSession();

  const businessDate = parseBusinessDate(businessDateKey);
  const comparableDates = Array.from({ length: YEARS_BACK }, (_, index) =>
    getComparableDate(businessDate, index + 1),
  );

  const records = await prisma.dailySales.findMany({
    where: {
      businessDate: {
        in: [businessDate, ...comparableDates],
      },
    },
    select: {
      id: true,
      businessDate: true,
      salesTotalCents: true,
      netSalesCents: true,
      transactionCount: true,
      notes: true,
      source: true,
    },
  });

  const salesByDate = new Map(
    records.map((record) => [formatDateKey(record.businessDate), record]),
  );

  const currentRecord = salesByDate.get(formatDateKey(businessDate));

  const comparisonRows = comparableDates
    .map((comparableDate) => {
      const comparableRecord = salesByDate.get(formatDateKey(comparableDate));

      if (!comparableRecord) {
        return null;
      }

      const currentSalesCents = currentRecord?.salesTotalCents ?? 0;
      const comparableSalesCents = comparableRecord.salesTotalCents;
      const differenceCents = currentSalesCents - comparableSalesCents;
      const percentageChange =
        comparableSalesCents > 0
          ? (differenceCents / comparableSalesCents) * 100
          : null;

      return {
        date: comparableDate,
        record: comparableRecord,
        differenceCents,
        percentageChange,
      };
    })
    .filter((row) => row !== null);

  const mostRecentComparison = comparisonRows[0] ?? null;

  const currentSalesCents = currentRecord?.salesTotalCents ?? 0;
  const mostRecentComparableSalesCents =
    mostRecentComparison?.record.salesTotalCents ?? 0;

  const differenceCents = currentSalesCents - mostRecentComparableSalesCents;

  const percentageChange =
    mostRecentComparableSalesCents > 0
      ? (differenceCents / mostRecentComparableSalesCents) * 100
      : null;

  const isDifferenceNegative = differenceCents < 0;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">SalesAlign</p>

          <h1 className="mt-2 text-4xl font-bold">
            {dateFormatter.format(businessDate)}
          </h1>

          <p className="mt-3 text-gray-600">
            Daily sales detail with weekday-aligned historical comparisons.
          </p>
        </div>

        <Link href="/calendar" className="rounded border px-4 py-2 font-medium">
          Back to calendar
        </Link>
      </div>

      {!isAdmin ? (
        <p className="mt-6 rounded-lg border p-4 text-sm text-gray-600">
          Read-only view. Admin access is required to edit, delete, or import
          sales records.
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Sales total</p>
          <p className="mt-3 text-3xl font-bold">
            {formatCurrency(currentSalesCents)}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {currentRecord ? "Recorded sales total" : "No record for this day"}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Comparable day sales</p>
          <p className="mt-3 text-3xl font-bold">
            {formatCurrency(mostRecentComparableSalesCents)}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {mostRecentComparison
              ? dateFormatter.format(mostRecentComparison.date)
              : "No comparable record"}
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
            Versus most recent comparable day
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-sm text-gray-600">Percentage change</p>
          <p
            className={`mt-3 text-3xl font-bold ${
              isDifferenceNegative ? "text-red-600" : "text-green-700"
            }`}
          >
            {formatPercentage(percentageChange)}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Based on comparable day sales
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-2xl font-bold">Comparable years</h2>

        {comparisonRows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4">Year</th>
                  <th className="py-2 pr-4">Comparable date</th>
                  <th className="py-2 pr-4">Sales total</th>
                  <th className="py-2 pr-4">Difference</th>
                  <th className="py-2 pr-4">Change</th>
                </tr>
              </thead>

              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={formatDateKey(row.date)} className="border-b">
                    <td className="py-2 pr-4">{row.date.getUTCFullYear()}</td>
                    <td className="py-2 pr-4">
                      {dateFormatter.format(row.date)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatCurrency(row.record.salesTotalCents)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatCurrency(row.differenceCents)}
                    </td>
                    <td className="py-2 pr-4">
                      {formatPercentage(row.percentageChange)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-gray-600">
            No weekday-aligned comparison records found.
          </p>
        )}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-2xl font-bold">Current day details</h2>

        {currentRecord ? (
          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-600">Sales total</dt>
              <dd className="text-xl font-bold">
                {formatCurrency(currentRecord.salesTotalCents)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-600">Net sales</dt>
              <dd className="text-xl font-bold">
                {currentRecord.netSalesCents === null
                  ? "N/A"
                  : formatCurrency(currentRecord.netSalesCents)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-600">Transactions</dt>
              <dd className="text-xl font-bold">
                {currentRecord.transactionCount ?? "N/A"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-gray-600">Source</dt>
              <dd className="text-xl font-bold">{currentRecord.source}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-gray-600">
            No sales record has been created for this date.
          </p>
        )}

        {currentRecord?.notes ? (
          <div className="mt-6">
            <h3 className="font-bold">Notes</h3>
            <p className="mt-2 text-gray-700">{currentRecord.notes}</p>
          </div>
        ) : null}
      </section>

      {isAdmin && currentRecord ? (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Edit sales record</h2>
          <DailySalesEditForm record={currentRecord} />
        </section>
      ) : null}

      {isAdmin && !currentRecord ? (
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-2xl font-bold">Add sales record</h2>
          <DailySalesCreateForDateForm businessDate={businessDateKey} />
        </section>
      ) : null}

      {isAdmin && currentRecord ? (
        <section className="mt-8 rounded-lg border border-red-200 p-6">
          <h2 className="text-2xl font-bold">Delete sales record</h2>
          <p className="mt-2 text-gray-600">
            Delete this sales record only if it was entered incorrectly.
          </p>
          <DailySalesDeleteForm recordId={currentRecord.id} />
        </section>
      ) : null}
    </main>
  );
}
