"use client";

import { useActionState } from "react";

import {
  createDailySales,
  type CreateDailySalesState,
} from "@/app/actions/dailySales";

type DailySalesCreateForDateFormProps = {
  businessDate: string;
};

const initialState: CreateDailySalesState = {
  success: false,
  message: "",
};

export function DailySalesCreateForDateForm({
  businessDate,
}: DailySalesCreateForDateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createDailySales,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 grid gap-4">
      <input type="hidden" name="businessDate" value={businessDate} />

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
          rows={4}
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
        {isPending ? "Saving..." : "Add sales record"}
      </button>
    </form>
  );
}
