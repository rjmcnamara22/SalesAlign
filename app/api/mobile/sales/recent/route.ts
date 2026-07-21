import { getBearerToken, verifyMobileAccessToken } from "@/lib/auth/mobileAuth";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: Request) {
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
    const records = await prisma.dailySales.findMany({
      orderBy: {
        businessDate: "desc",
      },
      take: 14,
      select: {
        id: true,
        businessDate: true,
        salesTotalCents: true,
        netSalesCents: true,
        transactionCount: true,
        source: true,
        updatedAt: true,
      },
    });

    return Response.json({
      records: records.map((record) => ({
        id: record.id,
        businessDate: record.businessDate.toISOString().slice(0, 10),
        salesTotalCents: record.salesTotalCents,
        netSalesCents: record.netSalesCents,
        transactionCount: record.transactionCount,
        source: record.source,
        updatedAt: record.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to load recent mobile sales:", error);

    return Response.json(
      {
        error: "Unable to load recent sales.",
      },
      {
        status: 500,
      },
    );
  }
}
