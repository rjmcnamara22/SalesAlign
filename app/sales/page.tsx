import Link from "next/link";

import { DailySalesForm } from "@/components/DailySalesForm";
import { prisma } from "@/lib/database/prisma";
import { getComparableDate } from "@/lib/comparison/getComparableDate";
import { redirectIfNotAdmin } from "@/lib/auth/admin";

function formatCurrency(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export default async function SalesPage() {
  await redirectIfNotAdmin();
  const salesRecords = await prisma.dailySales.findMany({
    orderBy: {
      businessDate: "desc",
    },
  });

  const salesByDate = new Map(
    salesRecords.map((record) => [formatDate(record.businessDate), record]),
  );

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Sales</h1>

          <p className="mt-2 text-gray-600">
            Add, review, and correct daily sales records.
          </p>
        </div>

        <Link
          href="/"
          className="whitespace-nowrap rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Back to dashboard
        </Link>
      </div>

      <DailySalesForm />

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Sales records</h2>

        {salesRecords.length === 0 ? (
          <p className="mt-4 text-gray-600">
            No daily sales records have been entered.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Date</th>
                  <th className="p-3">Sales Total</th>
                  <th className="p-3">Comparable date</th>
                  <th className="p-3">Comparable sales</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3">Change</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>

              <tbody>
                {salesRecords.map((record) => {
                  const comparableDate = getComparableDate(record.businessDate);

                  const comparableRecord = salesByDate.get(
                    formatDate(comparableDate),
                  );

                  const differenceCents = comparableRecord
                    ? record.salesTotalCents - comparableRecord.salesTotalCents
                    : null;

                  const percentageChange =
                    comparableRecord && comparableRecord.salesTotalCents !== 0
                      ? (differenceCents! / comparableRecord.salesTotalCents) *
                        100
                      : null;

                  return (
                    <tr key={record.id} className="border-b">
                      <td className="p-3">{formatDate(record.businessDate)}</td>

                      <td className="p-3">
                        {formatCurrency(record.salesTotalCents)}
                      </td>

                      <td className="p-3">{formatDate(comparableDate)}</td>

                      <td className="p-3">
                        {comparableRecord
                          ? formatCurrency(comparableRecord.salesTotalCents)
                          : "No record"}
                      </td>

                      <td className="p-3">{formatCurrency(differenceCents)}</td>

                      <td className="p-3">
                        {formatPercentage(percentageChange)}
                      </td>

                      <td className="p-3">{record.notes ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
