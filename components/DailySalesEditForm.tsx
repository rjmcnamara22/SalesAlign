"use client";

import { useActionState } from "react";

import {
  type UpdateDailySalesState,
  updateDailySales,
} from "@/app/actions/dailySales";

type DailySalesEditFormProps = {
  record: {
    id: string;
    salesTotalCents: number;
    netSalesCents: number | null;
    transactionCount: number | null;
    notes: string | null;
  };
};

const initialState: UpdateDailySalesState = {
  success: false,
  message: "",
};

function centsToDollars(cents: number | null) {
  if (cents === null) {
    return "";
  }

  return (cents / 100).toFixed(2);
}

export function DailySalesEditForm({ record }: DailySalesEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateDailySales,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 grid gap-4">
      <input type="hidden" name="id" value={record.id} />

      <div>
        <label htmlFor="salesTotal" className="mb-1 block font-medium">
          Total Sales
        </label>

        <input
          id="salesTotal"
          name="salesTotal"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={(record.salesTotalCents / 100).toFixed(2)}
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
          defaultValue={centsToDollars(record.netSalesCents)}
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
          defaultValue={record.transactionCount ?? ""}
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
          rows={4}
          defaultValue={record.notes ?? ""}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={state.success ? "text-green-700" : "text-red-700"}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving changes..." : "Save changes"}
      </button>
    </form>
  );
}
