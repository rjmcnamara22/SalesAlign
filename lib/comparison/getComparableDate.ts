import { subDays } from "date-fns";

const DAYS_IN_52_WEEKS = 364;

/**
 * Returns the weekday-aligned comparison date for a prior year.
 *
 * Subtracting 364 days preserves the actual day of the week instead of the date.
 */
export function getComparableDate(currentDate: Date, yearsBack = 1): Date {
  if (!Number.isInteger(yearsBack) || yearsBack < 1) {
    throw new Error("yearsBack must be a positive integer");
  }

  return subDays(currentDate, DAYS_IN_52_WEEKS * yearsBack);
}
