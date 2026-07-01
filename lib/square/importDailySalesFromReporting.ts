import { prisma } from "@/lib/database/prisma";

type ImportDailySalesFromReportingResult = {
  businessDate: string;
  grossSalesCents: number;
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
          "Sales.top_line_product_sales",
          "Sales.net_sales",
          "Sales.order_count",
          "Sales.discounts_amount",
          "Sales.tips_amount",
          "Sales.sales_tax_amount",
        ],
        dimensions: ["Sales.local_date", "Sales.location_id"],
        filters: [
          {
            member: "Sales.local_date",
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

  const grossSalesCents = toCents(row?.["Sales.top_line_product_sales"]);
  const netSalesCents = toNullableCents(row?.["Sales.net_sales"]);
  const transactionCount = toNullableNumber(row?.["Sales.order_count"]);

  await prisma.dailySales.upsert({
    where: {
      businessDate: new Date(`${businessDate}T00:00:00.000Z`),
    },
    create: {
      businessDate: new Date(`${businessDate}T00:00:00.000Z`),
      grossSalesCents,
      netSalesCents,
      transactionCount,
      source: "SQUARE",
      notes: "Imported from Square Reporting API.",
    },
    update: {
      grossSalesCents,
      netSalesCents,
      transactionCount,
      source: "SQUARE",
      notes: "Imported from Square Reporting API.",
    },
  });

  return {
    businessDate,
    grossSalesCents,
    netSalesCents,
    transactionCount,
  };
}
