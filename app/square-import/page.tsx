import Link from "next/link";

import { importDailySalesRangeFromReporting } from "@/lib/square/importDailySalesRangeFromReporting";
import { redirectIfNotAdmin, requireAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import { SquareImportSubmitButton } from "@/components/SquareImportSubmitButtom";

type SquareImportPageProps = {
  searchParams: Promise<{
    success?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

async function importSquareSalesRange(formData: FormData) {
  "use server";

  await requireAdmin();

  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  await importDailySalesRangeFromReporting(startDate, endDate);

  redirect(
    `/square-import?success=1&startDate=${encodeURIComponent(
      startDate,
    )}&endDate=${encodeURIComponent(endDate)}`,
  );
}

export default async function SquareImportPage({
  searchParams,
}: SquareImportPageProps) {
  const params = await searchParams;
  const hasSuccessMessage = params.success === "1";

  await redirectIfNotAdmin();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Square Import</h1>

          <p className="mt-2 text-gray-600">
            Import Square sales records for a selected date range. For large
            historical backfills, import one month at a time to avoid request
            timeouts.
          </p>
        </div>

        <Link
          href="/"
          className="whitespace-nowrap rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Back to dashboard
        </Link>
      </div>

      {hasSuccessMessage ? (
        <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Square import finished successfully
          {params.startDate && params.endDate
            ? ` for ${params.startDate} through ${params.endDate}.`
            : "."}
        </div>
      ) : null}

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

        <SquareImportSubmitButton />
      </form>
    </main>
  );
}
