"use client";

import { useFormStatus } from "react-dom";

export function SquareImportSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="grid gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Importing..." : "Import Date Range"}
      </button>
    </div>
  );
}
