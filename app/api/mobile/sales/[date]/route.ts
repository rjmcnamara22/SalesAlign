import { subDays } from "date-fns";
import { z } from "zod";

import { getBearerToken, verifyMobileAccessToken } from "@/lib/auth/mobileAuth";
import { prisma } from "@/lib/database/prisma";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.");

const COMPARISON_YEARS = [1, 2, 3] as const;
const DAYS_IN_52_WEEKS = 364;

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

function parseDateOnly(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request, context: RouteContext) {
  const accessToken = getBearerToken(request.headers.get("authorization"));

  if (!accessToken || !verifyMobileAccessToken(accessToken)) {
    return Response.json(
      {
        error: "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const { date } = await context.params;

    const parsedDate = dateSchema.safeParse(date);

    if (!parsedDate.success) {
      return Response.json(
        {
          error: "A valid date is required.",
        },
        {
          status: 400,
        },
      );
    }

    const businessDate = parseDateOnly(parsedDate.data);

    if (Number.isNaN(businessDate.getTime())) {
      return Response.json(
        {
          error: "A valid date is required.",
        },
        {
          status: 400,
        },
      );
    }

    const record = await prisma.dailySales.findUnique({
      where: {
        businessDate,
      },
      select: {
        businessDate: true,
        salesTotalCents: true,
        netSalesCents: true,
        transactionCount: true,
        source: true,
        notes: true,
        updatedAt: true,
      },
    });

    if (!record) {
      return Response.json(
        {
          error: "Sales record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const comparisonDates = COMPARISON_YEARS.map((yearsBack) => ({
      yearsBack,
      businessDate: subDays(record.businessDate, DAYS_IN_52_WEEKS * yearsBack),
    }));

    const comparisonRecords = await prisma.dailySales.findMany({
      where: {
        businessDate: {
          in: comparisonDates.map((comparison) => comparison.businessDate),
        },
      },
      select: {
        businessDate: true,
        salesTotalCents: true,
      },
    });

    const comparisonSalesByDate = new Map(
      comparisonRecords.map((comparison) => [
        formatDateOnly(comparison.businessDate),
        comparison,
      ]),
    );

    const comparisons = comparisonDates.map(({ yearsBack, businessDate }) => {
      const comparisonRecord = comparisonSalesByDate.get(
        formatDateOnly(businessDate),
      );

      if (!comparisonRecord) {
        return {
          yearsBack,
          businessDate: formatDateOnly(businessDate),
          salesTotalCents: null,
          dollarDifferenceCents: null,
          percentageChange: null,
        };
      }

      const dollarDifferenceCents =
        record.salesTotalCents - comparisonRecord.salesTotalCents;

      const percentageChange =
        comparisonRecord.salesTotalCents !== 0
          ? (dollarDifferenceCents / comparisonRecord.salesTotalCents) * 100
          : null;

      return {
        yearsBack,
        businessDate: formatDateOnly(comparisonRecord.businessDate),
        salesTotalCents: comparisonRecord.salesTotalCents,
        dollarDifferenceCents,
        percentageChange,
      };
    });

    return Response.json({
      record: {
        businessDate: formatDateOnly(record.businessDate),
        salesTotalCents: record.salesTotalCents,
        netSalesCents: record.netSalesCents,
        transactionCount: record.transactionCount,
        source: record.source,
        notes: record.notes,
        updatedAt: record.updatedAt.toISOString(),
      },
      comparisons,
    });
  } catch (error) {
    console.error("Failed to load mobile sales detail:", error);

    return Response.json(
      {
        error: "Unable to load sales detail.",
      },
      {
        status: 500,
      },
    );
  }
}
