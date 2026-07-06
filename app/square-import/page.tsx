import { importDailySalesRangeFromReporting } from "@/lib/square/importDailySalesRangeFromReporting";
import { redirectIfNotAdmin, requireAdmin } from "@/lib/auth/admin";

async function importSquareSalesRange(formData: FormData) {
  "use server";

  await requireAdmin();

  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  await importDailySalesRangeFromReporting(startDate, endDate);
}

export default async function SquareImportPage() {
  await redirectIfNotAdmin();

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">Square Import</h1>

      <p className="mt-2 text-gray-600">
        Import Square sales records for a selected date range. For large
        historical backfills, import one month at a time to avoid request
        timeouts.
      </p>

      <form
        action={importSquareSalesRange}
        className="mt-8 grid gap-4 rounded-lg border p-6"
      >
        <div>
          <label htmlFor="startDate" className="mb-1 block font-medium">
            Start date
          </label>

          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="mb-1 block font-medium">
            End date
          </label>

          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          Import date range
        </button>
      </form>
    </main>
  );
}
