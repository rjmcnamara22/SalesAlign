import { updateDailySalesNotes } from "@/app/actions/dailySales";

type DailySalesNotesFormProps = {
  recordId: string;
  notes: string | null;
  returnTo: string;
};

export function DailySalesNotesForm({
  recordId,
  notes,
  returnTo,
}: DailySalesNotesFormProps) {
  return (
    <form action={updateDailySalesNotes} className="grid gap-2">
      <input type="hidden" name="recordId" value={recordId} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <label htmlFor={`notes-${recordId}`} className="text-sm font-medium">
        Notes
      </label>

      <textarea
        id={`notes-${recordId}`}
        name="notes"
        defaultValue={notes ?? ""}
        rows={3}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder="Add context such as weather, events, holidays, closures, or unusual sales conditions."
      />

      <button
        type="submit"
        className="w-fit rounded bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Save notes
      </button>
    </form>
  );
}
