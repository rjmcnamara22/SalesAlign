import { prisma } from "@/lib/database/prisma";

type ImportDailySalesFromReportingResult = {
  businessDate: string;
  salesTotalCents: number;
  netSalesCents: number | null;
  transactionCount: number | null;
};

type ReportingApiResponse = {
  data?: Record<string, unknown>[];
};

function getReportingBaseUrl() {
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";

  return environment === "production"
    ? "https://connect.squareup.com/reporting"
    : "https://connect.squareupsandbox.com/reporting";
}

function toCents(value: unknown) {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }

  if (typeof value === "string") {
    return Math.round(Number(value) * 100);
  }

  return 0;
}

function toNullableCents(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  return toCents(value);
}

function toNullableNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export async function importDailySalesFromReporting(
  businessDate: string,
): Promise<ImportDailySalesFromReportingResult> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!accessToken) {
    throw new Error("SQUARE_ACCESS_TOKEN is not defined");
  }

  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID is not defined");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(businessDate)) {
    throw new Error("businessDate must be formatted as YYYY-MM-DD");
  }

  const response = await fetch(`${getReportingBaseUrl()}/v1/load`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        measures: [
          "Sales.net_sales",
          "Sales.sales_tax_amount",
          "Sales.order_count",
        ],
        dimensions: ["Sales.reporting_day", "Sales.location_id"],
        filters: [
          {
            member: "Sales.reporting_day",
            operator: "equals",
            values: [businessDate],
          },
          {
            member: "Sales.location_id",
            operator: "equals",
            values: [locationId],
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Square Reporting API request failed: ${response.status} ${errorText}`,
    );
  }

  const payload = (await response.json()) as ReportingApiResponse;
  const row = payload.data?.[0];

  const netSalesCents = toNullableCents(row?.["Sales.net_sales"]);
  const taxesCents = toNullableCents(row?.["Sales.sales_tax_amount"]);
  const transactionCount = toNullableNumber(row?.["Sales.order_count"]);

  const salesTotalCents = (netSalesCents ?? 0) + (taxesCents ?? 0);

  await prisma.dailySales.upsert({
    where: {
      businessDate: new Date(`${businessDate}T00:00:00.000Z`),
    },
    create: {
      businessDate: new Date(`${businessDate}T00:00:00.000Z`),
      salesTotalCents,
      netSalesCents,
      transactionCount,
      source: "SQUARE",
      notes: "Imported from Square Reporting API.",
    },
    update: {
      salesTotalCents,
      netSalesCents,
      transactionCount,
      source: "SQUARE",
      notes: "Imported from Square Reporting API.",
    },
  });

  return {
    businessDate,
    salesTotalCents,
    netSalesCents,
    transactionCount,
  };
}
