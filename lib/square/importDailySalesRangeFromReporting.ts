import { importDailySalesFromReporting } from "@/lib/square/importDailySalesFromReporting";

type ImportSalesRangeResult = {
  startDate: string;
  endDate: string;
  totalDays: number;
  importedDays: number;
  failedDays: number;
  failures: {
    businessDate: string;
    message: string;
  }[];
};

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getDateRange(startDate: string, endDate: string) {
  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    throw new Error("Start date and end date must be formatted as YYYY-MM-DD");
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (start > end) {
    throw new Error("Start date must be before or equal to end date");
  }

  const dates: string[] = [];

  for (
    let currentDate = start;
    currentDate <= end;
    currentDate = addDays(currentDate, 1)
  ) {
    dates.push(formatDate(currentDate));
  }

  return dates;
}

export async function importDailySalesRangeFromReporting(
  startDate: string,
  endDate: string,
): Promise<ImportSalesRangeResult> {
  const businessDates = getDateRange(startDate, endDate);

  const failures: ImportSalesRangeResult["failures"] = [];
  let importedDays = 0;

  for (const businessDate of businessDates) {
    try {
      await importDailySalesFromReporting(businessDate);
      importedDays += 1;
    } catch (error) {
      failures.push({
        businessDate,
        message:
          error instanceof Error ? error.message : "Unknown import error",
      });
    }
  }

  return {
    startDate,
    endDate,
    totalDays: businessDates.length,
    importedDays,
    failedDays: failures.length,
    failures,
  };
}
