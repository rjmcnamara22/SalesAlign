import { describe, expect, it } from "vitest";

import { getComparableDate } from "./getComparableDate";

describe("getComparableDate", () => {
  it("subtracts 364 days for one prior comparison year", () => {
    const currentDate = new Date(2026, 5, 30);
    const result = getComparableDate(currentDate);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
  });

  it("preserves the weekday", () => {
    const currentDate = new Date(2026, 5, 30);
    const result = getComparableDate(currentDate);

    expect(result.getDay()).toBe(currentDate.getDay());
  });

  it("supports multiple years back", () => {
    const currentDate = new Date(2026, 5, 30);
    const result = getComparableDate(currentDate, 2);

    expect(result.getDay()).toBe(currentDate.getDay());
    expect(result).toEqual(new Date(2024, 6, 2));
  });

  it("works across month and year boundaries", () => {
    const currentDate = new Date(2026, 0, 1);
    const result = getComparableDate(currentDate);

    expect(result).toEqual(new Date(2025, 0, 2));
    expect(result.getDay()).toBe(currentDate.getDay());
  });

  it("rejects invalid yearsBack values", () => {
    expect(() => getComparableDate(new Date(), 0)).toThrow(
      "yearsBack must be a positive integer",
    );

    expect(() => getComparableDate(new Date(), 1.5)).toThrow(
      "yearsBack must be a positive integer",
    );
  });
});
