import { createDailySales } from "@/app/actions/dailySales";
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

      <form
        action={createDailySales}
        className="mt-8 grid gap-4 rounded-lg border p-6"
      >
        <div>
          <label htmlFor="businessDate" className="mb-1 block font-medium">
            Business date
          </label>

          <input
            id="businessDate"
            name="businessDate"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="grossSales" className="mb-1 block font-medium">
            Gross sales
          </label>

          <input
            id="grossSales"
            name="grossSales"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="netSales" className="mb-1 block font-medium">
            Net sales
          </label>

          <input
            id="netSales"
            name="netSales"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="transactionCount" className="mb-1 block font-medium">
            Transaction count
          </label>

          <input
            id="transactionCount"
            name="transactionCount"
            type="number"
            min="0"
            step="1"
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block font-medium">
            Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          Save daily sales
        </button>
      </form>

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
