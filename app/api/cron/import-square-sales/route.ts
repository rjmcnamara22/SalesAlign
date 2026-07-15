import { importDailySalesFromReporting } from "@/lib/square/importDailySalesFromReporting";
import { getLatestCompletedReportingDate } from "@/lib/reporting/getLatestCompletedReportingDate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      : getLatestCompletedReportingDate();

  const result = await importDailySalesFromReporting(businessDate);

  return Response.json({
    ok: true,
    importedDate: businessDate,
    result,
  });
}
