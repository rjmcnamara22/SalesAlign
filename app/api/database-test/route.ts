import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const dailySalesRecords = await prisma.dailySales.count();

    return NextResponse.json({
      connected: true,
      dailySalesRecords,
    });
  } catch (error) {
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        connected: false,
        error: "Unable to connect to the database.",
      },
      { status: 500 },
    );
  }
}
