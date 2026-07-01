import { fromZonedTime } from "date-fns-tz";

export function getBusinessDateRangeUtc(businessDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(businessDate)) {
    throw new Error("businessDate must be formatted as YYYY-MM-DD");
  }

  const timeZone = process.env.BUSINESS_TIMEZONE ?? "America/New_York";

  const startDate = fromZonedTime(`${businessDate}T00:00:00`, timeZone);

  const [year, month, day] = businessDate.split("-").map(Number);
  const nextBusinessDate = new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);

  const endDate = fromZonedTime(`${nextBusinessDate}T00:00:00`, timeZone);

  return {
    startAt: startDate.toISOString(),
    endAt: endDate.toISOString(),
  };
}
