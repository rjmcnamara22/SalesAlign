import { importDailySalesFromReporting } from "@/lib/square/importDailySalesFromReporting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatEasternDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function getEasternHour(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
  });

  return Number(formatter.format(date));
}

function subtractDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() - days);
  return nextDate;
}

function getPreviousReportingDate() {
  const now = new Date();

  return formatEasternDate(subtractDays(now, 1));
}

function isAuthorizedCronRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date");

  const businessDate =
    requestedDate && isValidDateString(requestedDate)
      ? requestedDate
      : getPreviousReportingDate();

  const result = await importDailySalesFromReporting(businessDate);

  return Response.json({
    ok: true,
    importedDate: businessDate,
    result,
  });
}
