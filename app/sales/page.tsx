import { DailySalesForm } from "@/components/DailySalesForm";
import { prisma } from "@/lib/database/prisma";

function formatCurrency(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function SalesPage() {
  const salesRecords = await prisma.dailySales.findMany({
    orderBy: {
      businessDate: "desc",
    },
  });

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
                  <th className="p-3">Net sales</th>
                  <th className="p-3">Transactions</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>

              <tbody>
                {salesRecords.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-3">
                      {record.businessDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="p-3">
                      {formatCurrency(record.grossSalesCents)}
                    </td>
                    <td className="p-3">
                      {formatCurrency(record.netSalesCents)}
                    </td>
                    <td className="p-3">{record.transactionCount ?? "—"}</td>
                    <td className="p-3">{record.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
