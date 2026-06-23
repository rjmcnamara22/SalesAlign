"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

const dailySalesSchema = z.object({
  businessDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid business date"),

  grossSales: z.coerce.number().min(0, "Gross sales cannot be negative"),

  netSales: z
    .union([
      z.literal(""),
      z.coerce.number().min(0, "Net sales cannot be negative"),
    ])
    .optional(),

  transactionCount: z
    .union([
      z.literal(""),
      z.coerce
        .number()
        .int("Transaction count must be a whole number")
        .min(0, "Transaction count cannot be negative"),
    ])
    .optional(),

  notes: z.string().trim().max(500).optional(),
});

export type CreateDailySalesState = {
  success: boolean;
  message: string;
};

export async function createDailySales(
  previousState: CreateDailySalesState,
  formData: FormData,
): Promise<CreateDailySalesState> {
  const result = dailySalesSchema.safeParse({
    businessDate: formData.get("businessDate"),
    grossSales: formData.get("grossSales"),
    netSales: formData.get("netSales"),
    transactionCount: formData.get("transactionCount"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid sales data",
    };
  }

  const { businessDate, grossSales, netSales, transactionCount, notes } =
    result.data;

  try {
    await prisma.dailySales.create({
      data: {
        businessDate: new Date(`${businessDate}T00:00:00.000Z`),
        grossSalesCents: Math.round(grossSales * 100),
        netSalesCents:
          netSales === "" || netSales === undefined
            ? null
            : Math.round(netSales * 100),
        transactionCount:
          transactionCount === "" || transactionCount === undefined
            ? null
            : transactionCount,
        notes: notes || null,
      },
    });

    revalidatePath("/sales");

    return {
      success: true,
      message: "Daily sales record created.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A sales record already exists for that date.",
      };
    }

    console.error("Failed to create daily sales record:", error);

    return {
      success: false,
      message: "Unable to save the daily sales record.",
    };
  }
}
