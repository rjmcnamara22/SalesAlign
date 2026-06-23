const DAYS_IN_52_WEEKS = 364;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getComparableDate(currentDate: Date, yearsBack = 1): Date {
  if (!Number.isInteger(yearsBack) || yearsBack < 1) {
    throw new Error("yearsBack must be a positive integer");
  }

  return new Date(
    currentDate.getTime() - DAYS_IN_52_WEEKS * yearsBack * MILLISECONDS_PER_DAY,
  );
}
