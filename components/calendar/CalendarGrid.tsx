import { CalendarDayCell } from "@/components/calendar/CalendarDayCell";
import {
  getMonthCalendarDays,
  type CalendarDay,
} from "@/lib/calendar/getMonthCalendarDays";

type DailySalesRecord = {
  businessDate: Date;
  grossSalesCents: number;
};

type CalendarGridProps = {
  year: number;
  monthIndex: number;
  salesRecords: DailySalesRecord[];
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function CalendarGrid({
  year,
  monthIndex,
  salesRecords,
}: CalendarGridProps) {
  const calendarDays: CalendarDay[] = getMonthCalendarDays(year, monthIndex);

  const salesByDate = new Map(
    salesRecords.map((record) => [formatDateKey(record.businessDate), record]),
  );

  return (
    <div className="mt-6 overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 bg-gray-100">
        {WEEKDAY_LABELS.map((weekday) => (
          <div
            key={weekday}
            className="border-r p-3 text-center text-sm font-semibold last:border-r-0"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((calendarDay) => {
          const dateKey = formatDateKey(calendarDay.date);
          const salesRecord = salesByDate.get(dateKey);

          return (
            <CalendarDayCell
              key={dateKey}
              date={calendarDay.date}
              isCurrentMonth={calendarDay.isCurrentMonth}
              grossSalesCents={salesRecord?.grossSalesCents ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
