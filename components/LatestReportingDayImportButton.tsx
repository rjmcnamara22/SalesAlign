"use client";

import { useFormStatus } from "react-dom";

export function LatestReportingDayImportButton() {
  const { pending } = useFormStatus();

  return (
    <div className="grid gap-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Importing latest reporting day..."
          : "Import latest completed reporting day"}
      </button>

      {pending ? (
        <p className="text-sm text-gray-600">
          Importing the latest completed Square reporting day.
        </p>
      ) : null}
    </div>
  );
}
