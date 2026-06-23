import { DailySalesForm } from "@/components/DailySalesForm";
import { prisma } from "@/lib/database/prisma";
import { getComparableDate } from "@/lib/comparison/getComparableDate";

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
      <h1 className="text-3xl font-bold">Daily Sales</h1>

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
                  <th className="p-3">Gross sales</th>
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
                    ? record.grossSalesCents - comparableRecord.grossSalesCents
                    : null;

                  const percentageChange =
                    comparableRecord && comparableRecord.grossSalesCents !== 0
                      ? (differenceCents! / comparableRecord.grossSalesCents) *
                        100
                      : null;

                  return (
                    <tr key={record.id} className="border-b">
                      <td className="p-3">{formatDate(record.businessDate)}</td>

                      <td className="p-3">
                        {formatCurrency(record.grossSalesCents)}
                      </td>

                      <td className="p-3">{formatDate(comparableDate)}</td>

                      <td className="p-3">
                        {comparableRecord
                          ? formatCurrency(comparableRecord.grossSalesCents)
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
