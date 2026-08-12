import Link from "next/link";

type CalendarCellComparison = {
  yearLabel: number;
  date: Date;
  salesTotalCents: number | null;
};

type CalendarMobileDayCardProps = {
  date: Date;
  salesTotalCents: number | null;
  comparisons: CalendarCellComparison[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatCurrency(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  return currencyFormatter.format(cents / 100);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date) {
  return date.toISOString().slice(5, 10);
}

export function CalendarMobileDayCard({
  date,
  salesTotalCents,
  comparisons,
}: CalendarMobileDayCardProps) {
  const dateKey = formatDateKey(date);

  const previousYearComparisonsWithSales = comparisons.filter(
    (comparison) => comparison.salesTotalCents !== null,
  );

  const beatAllPreviousYears =
    salesTotalCents !== null &&
    previousYearComparisonsWithSales.length > 0 &&
    previousYearComparisonsWithSales.every(
      (comparison) => salesTotalCents > comparison.salesTotalCents!,
    );

  return (
    <Link
      href={`/calendar/day?date=${dateKey}`}
      className="block rounded-lg border p-4 transition hover:bg-gray-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {dateFormatter.format(date)}
          </p>

          {salesTotalCents === null ? (
            <p className="mt-2 text-lg font-semibold text-gray-400">
              No imported record
            </p>
          ) : (
            <p
              className={`mt-2 text-2xl font-bold ${
                beatAllPreviousYears ? "text-green-600" : "text-gray-900"
              }`}
            >
              {formatCurrency(salesTotalCents)}
            </p>
          )}
        </div>

        <span className="text-sm text-gray-400">View</span>
      </div>

      {comparisons.length > 0 ? (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Previous years
          </p>

          <div className="mt-2 grid gap-2">
            {comparisons.map((comparison) => (
              <div
                key={comparison.date.toISOString()}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-gray-600">
                  {comparison.yearLabel}{" "}
                  <span className="text-gray-400">
                    ({formatShortDate(comparison.date)})
                  </span>
                </span>

                <span className="font-medium text-gray-900">
                  {formatCurrency(comparison.salesTotalCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 border-t pt-3 text-sm text-gray-400">
          No prior comparison data
        </p>
      )}
    </Link>
  );
}
