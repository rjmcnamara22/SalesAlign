import { CalendarDayCell } from "@/components/calendar/CalendarDayCell";
import { CalendarMobileDayCard } from "@/components/calendar/CalendarMobileDayCard";
import {
  getMonthCalendarDays,
  type CalendarDay,
} from "@/lib/calendar/getMonthCalendarDays";
import { getComparableDate } from "@/lib/comparison/getComparableDate";

type DailySalesRecord = {
  businessDate: Date;
  salesTotalCents: number;
};

type CalendarGridProps = {
  year: number;
  monthIndex: number;
  salesRecords: DailySalesRecord[];
  yearsBack?: number;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function CalendarGrid({
  year,
  monthIndex,
  salesRecords,
  yearsBack = 8,
}: CalendarGridProps) {
  const calendarDays: CalendarDay[] = getMonthCalendarDays(year, monthIndex);

  const salesByDate = new Map(
    salesRecords.map((record) => [formatDateKey(record.businessDate), record]),
  );

  function getComparisonsForDate(date: Date) {
    return Array.from({ length: yearsBack }, (_, index) => {
      const comparableDate = getComparableDate(date, index + 1);

      const comparableRecord = salesByDate.get(formatDateKey(comparableDate));

      return {
        yearLabel: comparableDate.getUTCFullYear(),
        date: comparableDate,
        salesTotalCents: comparableRecord?.salesTotalCents ?? null,
      };
    }).filter((comparison) => comparison.salesTotalCents !== null);
  }

  return (
    <div className="mt-6">
      <div className="grid gap-3 md:hidden">
        {calendarDays
          .filter((calendarDay) => calendarDay.isCurrentMonth)
          .map((calendarDay) => {
            const dateKey = formatDateKey(calendarDay.date);
            const salesRecord = salesByDate.get(dateKey);
            const comparisons = getComparisonsForDate(calendarDay.date);

            return (
              <CalendarMobileDayCard
                key={dateKey}
                date={calendarDay.date}
                salesTotalCents={salesRecord?.salesTotalCents ?? null}
                comparisons={comparisons}
              />
            );
          })}
      </div>

      <div className="hidden overflow-hidden rounded-lg border md:block">
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
            const comparisons = getComparisonsForDate(calendarDay.date);

            return (
              <CalendarDayCell
                key={dateKey}
                date={calendarDay.date}
                isCurrentMonth={calendarDay.isCurrentMonth}
                salesTotalCents={salesRecord?.salesTotalCents ?? null}
                comparisons={comparisons}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
