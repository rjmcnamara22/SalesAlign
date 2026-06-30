export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

const DAYS_IN_WEEK = 7;
const CALENDAR_WEEKS = 6;
const CALENDAR_GRID_DAYS = DAYS_IN_WEEK * CALENDAR_WEEKS;

export function getMonthCalendarDays(year: number, monthIndex: number) {
  if (!Number.isInteger(year)) {
    throw new Error("year must be an integer");
  }

  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    throw new Error("monthIndex must be an integer from 0 to 11");
  }

  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const firstWeekday = firstDayOfMonth.getDay();

  const calendarStartDate = new Date(year, monthIndex, 1 - firstWeekday);

  const days: CalendarDay[] = [];

  for (let dayOffset = 0; dayOffset < CALENDAR_GRID_DAYS; dayOffset++) {
    const date = new Date(
      calendarStartDate.getFullYear(),
      calendarStartDate.getMonth(),
      calendarStartDate.getDate() + dayOffset,
    );

    days.push({
      date,
      isCurrentMonth: date.getMonth() === monthIndex,
    });
  }

  return days;
}
