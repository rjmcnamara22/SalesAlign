import { subDays } from "date-fns";

import { prisma } from "@/lib/database/prisma";

const DAYS_IN_52_WEEKS = 364;

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const latestSales = await prisma.dailySales.findFirst({
      orderBy: {
        businessDate: "desc",
      },
      select: {
        businessDate: true,
        salesTotalCents: true,
        transactionCount: true,
        updatedAt: true,
      },
    });

    if (!latestSales) {
      return Response.json(
        {
          error: "No sales records were found.",
        },
        {
          status: 404,
        },
      );
    }

    const comparableDate = subDays(latestSales.businessDate, DAYS_IN_52_WEEKS);

    const comparableSales = await prisma.dailySales.findUnique({
      where: {
        businessDate: comparableDate,
      },
      select: {
        businessDate: true,
        salesTotalCents: true,
      },
    });

    const dollarDifferenceCents = comparableSales
      ? latestSales.salesTotalCents - comparableSales.salesTotalCents
      : null;

    const percentageChange =
      comparableSales && comparableSales.salesTotalCents !== 0
        ? (dollarDifferenceCents! / comparableSales.salesTotalCents) * 100
        : null;

    return Response.json({
      reportingDate: formatDateOnly(latestSales.businessDate),
      salesTotalCents: latestSales.salesTotalCents,
      comparableDate: comparableSales
        ? formatDateOnly(comparableSales.businessDate)
        : null,
      comparableSalesTotalCents: comparableSales?.salesTotalCents ?? null,
      dollarDifferenceCents,
      percentageChange,
      transactionCount: latestSales.transactionCount,
      lastImportedAt: latestSales.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to load mobile dashboard summary:", error);

    return Response.json(
      {
        error: "Unable to load dashboard data.",
      },
      {
        status: 500,
      },
    );
  }
}
