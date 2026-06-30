type CalendarDayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  grossSalesCents: number | null;
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

export function CalendarDayCell({
  date,
  isCurrentMonth,
  grossSalesCents,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();
  const formattedSales = formatCurrency(grossSalesCents);

  return (
    <div
      className={`min-h-28 border p-3 ${
        isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium">{dayNumber}</span>
      </div>

      {formattedSales ? (
        <div className="mt-3 rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900">
          {formattedSales}
        </div>
      ) : (
        <div className="mt-3 text-xs text-gray-400">No sales</div>
      )}
    </div>
  );
}
