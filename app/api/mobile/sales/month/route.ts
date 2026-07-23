import { subDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getBearerToken, verifyMobileAccessToken } from "@/lib/auth/mobileAuth";
import { prisma } from "@/lib/database/prisma";

const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request.headers.get("authorization"));

    if (!token || !verifyMobileAccessToken(token)) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const parsedQuery = querySchema.safeParse({
      year: searchParams.get("year"),
      month: searchParams.get("month"),
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: "A valid year and month are required.",
        },
        {
          status: 400,
        },
      );
    }

    const { year, month } = parsedQuery.data;

    const monthStart = new Date(Date.UTC(year, month - 1, 1));

    const nextMonthStart = new Date(Date.UTC(year, month, 1));

    const currentRecords = await prisma.dailySales.findMany({
      where: {
        businessDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      orderBy: {
        businessDate: "asc",
      },
      select: {
        id: true,
        businessDate: true,
        salesTotalCents: true,
        netSalesCents: true,
        transactionCount: true,
        source: true,
      },
    });

    const comparisonDates = currentRecords.map((record) =>
      subDays(record.businessDate, 364),
    );

    const comparisonRecords =
      comparisonDates.length === 0
        ? []
        : await prisma.dailySales.findMany({
            where: {
              businessDate: {
                in: comparisonDates,
              },
            },
            select: {
              businessDate: true,
              salesTotalCents: true,
            },
          });

    const comparisonMap = new Map(
      comparisonRecords.map((record) => [
        formatDateOnly(record.businessDate),
        record.salesTotalCents,
      ]),
    );

    const records = currentRecords.map((record) => {
      const comparisonDate = subDays(record.businessDate, 364);

      const comparisonDateString = formatDateOnly(comparisonDate);

      const priorYearSalesTotalCents =
        comparisonMap.get(comparisonDateString) ?? null;

      const dollarDifferenceCents =
        priorYearSalesTotalCents === null
          ? null
          : record.salesTotalCents - priorYearSalesTotalCents;

      const percentageChange =
        priorYearSalesTotalCents === null || priorYearSalesTotalCents === 0
          ? null
          : (dollarDifferenceCents! / priorYearSalesTotalCents) * 100;

      return {
        id: record.id,
        businessDate: formatDateOnly(record.businessDate),
        salesTotalCents: record.salesTotalCents,
        netSalesCents: record.netSalesCents,
        transactionCount: record.transactionCount,
        source: record.source,
        priorYear: {
          businessDate: comparisonDateString,
          salesTotalCents: priorYearSalesTotalCents,
          dollarDifferenceCents,
          percentageChange,
        },
      };
    });

    return NextResponse.json({
      year,
      month,
      records,
    });
  } catch (error) {
    console.error("Failed to load mobile sales month:", error);

    return NextResponse.json(
      {
        error: "Unable to load monthly sales.",
      },
      {
        status: 500,
      },
    );
  }
}
