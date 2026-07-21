export async function GET() {
  return Response.json({
    reportingDate: "2026-07-19",
    salesTotalCents: 143632,
    comparableDate: "2025-07-20",
    comparableSalesTotalCents: 125000,
    dollarDifferenceCents: 18632,
    percentageChange: 14.91,
    transactionCount: 87,
    lastImportedAt: "2026-07-20T13:18:00.000Z",
  });
}
