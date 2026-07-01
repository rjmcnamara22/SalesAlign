"use client";

import { useActionState } from "react";

import {
  deleteDailySales,
  type DeleteDailySalesState,
} from "@/app/actions/dailySales";

type DailySalesDeleteFormProps = {
  recordId: string;
};

const initialState: DeleteDailySalesState = {
  success: false,
  message: "",
};

export function DailySalesDeleteForm({ recordId }: DailySalesDeleteFormProps) {
  const [state, formAction, isPending] = useActionState(
    deleteDailySales,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="id" value={recordId} />

      {state.message && (
        <p
          aria-live="polite"
          className={
            state.success ? "mb-3 text-green-700" : "mb-3 text-red-700"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        onClick={(event) => {
          const confirmed = window.confirm(
            "Are you sure you want to delete this daily sales record?",
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
        className="rounded bg-red-700 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete sales record"}
      </button>
    </form>
  );
}
