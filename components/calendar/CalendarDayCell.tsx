type CalendarDayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  grossSalesCents: number | null;
  comparableDate: Date;
  comparableGrossSalesCents: number | null;
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

function formatDifference(cents: number | null) {
  if (cents === null) {
    return "—";
  }

  const formattedValue = formatCurrency(Math.abs(cents));

  return cents >= 0 ? `+${formattedValue}` : `-${formattedValue}`;
}

function formatPercentage(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function CalendarDayCell({
  date,
  isCurrentMonth,
  grossSalesCents,
  comparableDate,
  comparableGrossSalesCents,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();

  const differenceCents =
    grossSalesCents !== null && comparableGrossSalesCents !== null
      ? grossSalesCents - comparableGrossSalesCents
      : null;

  const percentageChange =
    differenceCents !== null &&
    comparableGrossSalesCents !== null &&
    comparableGrossSalesCents !== 0
      ? (differenceCents / comparableGrossSalesCents) * 100
      : null;

  return (
    <div
      className={`min-h-36 border p-3 ${
        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold">{dayNumber}</span>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        <div>
          <p className="text-gray-500">Sales</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(grossSalesCents)}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Vs {formatDate(comparableDate)}</p>
          <p className="font-medium">
            {formatCurrency(comparableGrossSalesCents)}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Change</p>
          <p
            className={`font-semibold ${
              differenceCents === null
                ? "text-gray-400"
                : differenceCents >= 0
                  ? "text-green-700"
                  : "text-red-700"
            }`}
          >
            {formatDifference(differenceCents)} /{" "}
            {formatPercentage(percentageChange)}
          </p>
        </div>
      </div>
    </div>
  );
}
