import Link from "next/link";

import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { getMonthCalendarDays } from "@/lib/calendar/getMonthCalendarDays";
import { getComparableDate } from "@/lib/comparison/getComparableDate";
import { prisma } from "@/lib/database/prisma";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CalendarPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

function getValidCalendarDate(
  yearParam: string | undefined,
  monthParam: string | undefined,
) {
  const today = new Date();

  const parsedYear = yearParam ? Number(yearParam) : today.getFullYear();
  const parsedMonth = monthParam ? Number(monthParam) : today.getMonth() + 1;

  const year = Number.isInteger(parsedYear) ? parsedYear : today.getFullYear();

  const monthNumber =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : today.getMonth() + 1;

  return {
    year,
    monthIndex: monthNumber - 1,
  };
}

function getAdjacentMonth(year: number, monthIndex: number, offset: -1 | 1) {
  const date = new Date(year, monthIndex + offset, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params = await searchParams;

  const { year, monthIndex } = getValidCalendarDate(params.year, params.month);

  const previousMonth = getAdjacentMonth(year, monthIndex, -1);
  const nextMonth = getAdjacentMonth(year, monthIndex, 1);

  const calendarDays = getMonthCalendarDays(year, monthIndex);

  const visibleStartDate = calendarDays[0].date;
  const visibleEndDate = calendarDays[calendarDays.length - 1].date;

  const YEARS_BACK = 8;

  const comparableStartDate = getComparableDate(visibleStartDate, YEARS_BACK);
  const queryEndDate = addDays(visibleEndDate, 1);

  const salesRecords = await prisma.dailySales.findMany({
    where: {
      businessDate: {
        gte: comparableStartDate,
        lt: queryEndDate,
      },
    },
    select: {
      businessDate: true,
      salesTotalCents: true,
    },
    orderBy: {
      businessDate: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Sales calendar</p>

          <h1 className="text-3xl font-bold">
            {MONTH_NAMES[monthIndex]} {year}
          </h1>

          <p className="mt-2 text-gray-600">
            Daily sales totals compared with weekday-aligned dates from previous
            years.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Link
            href="/"
            className="whitespace-nowrap rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Back to dashboard
          </Link>

          <div className="flex gap-2">
            <Link
              href={`/calendar?year=${previousMonth.year}&month=${previousMonth.month}`}
              className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Previous
            </Link>

            <Link
              href={`/calendar?year=${nextMonth.year}&month=${nextMonth.month}`}
              className="rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Next
            </Link>
          </div>
        </div>
      </div>

      <CalendarGrid
        year={year}
        monthIndex={monthIndex}
        salesRecords={salesRecords}
        yearsBack={YEARS_BACK}
      />
    </main>
  );
}
