import Link from "next/link";

type CalendarCellComparison = {
  yearLabel: number;
  date: Date;
  salesTotalCents: number | null;
};

type CalendarDayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  salesTotalCents: number | null;
  comparisons: CalendarCellComparison[];
};

function formatCurrency(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return date.toISOString().slice(5, 10);
}

export function CalendarDayCell({
  date,
  isCurrentMonth,
  salesTotalCents,
  comparisons,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();
  const dateKey = date.toISOString().slice(0, 10);

  return (
    <Link
      href={`/calendar/day?date=${dateKey}`}
      className={`block min-h-44 border p-3 transition hover:bg-gray-100 ${
        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold">{dayNumber}</span>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        <div>
          <p className="text-gray-500">Current</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(salesTotalCents)}
          </p>
        </div>

        {comparisons.length > 0 ? (
          <div className="space-y-1">
            <p className="text-gray-500">Previous years</p>

            {comparisons.map((comparison) => (
              <div
                key={comparison.date.toISOString()}
                className="flex justify-between gap-2"
              >
                <span>
                  {comparison.yearLabel}{" "}
                  <span className="text-gray-400">
                    ({formatDate(comparison.date)})
                  </span>
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(comparison.salesTotalCents)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No prior comparison data</p>
        )}
      </div>
    </Link>
  );
}
