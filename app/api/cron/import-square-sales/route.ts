import { importDailySalesFromReporting } from "@/lib/square/importDailySalesFromReporting";

export const runtime = "nodejs";

function getEasternBusinessDateToImport() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return Response.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessDate = getEasternBusinessDateToImport();
  const result = await importDailySalesFromReporting(businessDate);

  return Response.json({
    ok: true,
    importedDate: businessDate,
    result,
  });
}
