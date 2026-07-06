"use client";

import { useActionState } from "react";

import {
  createDailySales,
  type CreateDailySalesState,
} from "@/app/actions/dailySales";

const initialState: CreateDailySalesState = {
  success: false,
  message: "",
};

export function DailySalesForm() {
  const [state, formAction, isPending] = useActionState(
    createDailySales,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4 rounded-lg border p-6">
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
        {isPending ? "Saving..." : "Save daily sales"}
      </button>
    </form>
  );
}
