import { importDailySalesFromReporting } from "@/lib/square/importDailySalesFromReporting";

async function importSquareSales(formData: FormData) {
  "use server";

  const businessDate = String(formData.get("businessDate") ?? "");

  await importDailySalesFromReporting(businessDate);
}

export default function SquareImportPage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">Square Import</h1>

      <p className="mt-2 text-gray-600">
        Import one day of Square sales into the daily sales table.
      </p>

      <form
        action={importSquareSales}
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

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          Import from Square
        </button>
      </form>
    </main>
  );
}
