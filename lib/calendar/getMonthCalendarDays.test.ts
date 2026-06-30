import { describe, expect, it } from "vitest";

import { getMonthCalendarDays } from "./getMonthCalendarDays";

describe("getMonthCalendarDays", () => {
  it("returns 42 calendar days", () => {
    const days = getMonthCalendarDays(2026, 5);

    expect(days).toHaveLength(42);
  });

  it("starts the grid on Sunday", () => {
    const days = getMonthCalendarDays(2026, 5);

    expect(days[0].date.getDay()).toBe(0);
  });

  it("ends the grid on Saturday", () => {
    const days = getMonthCalendarDays(2026, 5);

    expect(days[days.length - 1].date.getDay()).toBe(6);
  });

  it("marks days from the selected month as current month", () => {
    const days = getMonthCalendarDays(2026, 5);

    const juneDays = days.filter((day) => day.isCurrentMonth);

    expect(juneDays).toHaveLength(30);
    expect(juneDays[0].date).toEqual(new Date(2026, 5, 1));
    expect(juneDays[juneDays.length - 1].date).toEqual(new Date(2026, 5, 30));
  });

  it("includes leading days from the previous month when needed", () => {
    const days = getMonthCalendarDays(2026, 7);

    expect(days[0].date).toEqual(new Date(2026, 6, 26));
    expect(days[0].isCurrentMonth).toBe(false);
  });

  it("rejects invalid month indexes", () => {
    expect(() => getMonthCalendarDays(2026, -1)).toThrow(
      "monthIndex must be an integer from 0 to 11",
    );

    expect(() => getMonthCalendarDays(2026, 12)).toThrow(
      "monthIndex must be an integer from 0 to 11",
    );
  });
});
