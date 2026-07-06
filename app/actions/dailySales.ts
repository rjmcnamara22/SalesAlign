"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

import { requireAdmin } from "@/lib/auth/admin";

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
  await requireAdmin();

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

const deleteDailySalesSchema = z.object({
  id: z.string().min(1, "Missing sales record ID"),
});

export type DeleteDailySalesState = {
  success: boolean;
  message: string;
};

export async function deleteDailySales(
  previousState: DeleteDailySalesState,
  formData: FormData,
): Promise<DeleteDailySalesState> {
  await requireAdmin();
  const result = deleteDailySalesSchema.safeParse({
    id: formData.get("id"),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid sales record",
    };
  }

  try {
    await prisma.dailySales.delete({
      where: {
        id: result.data.id,
      },
    });

    revalidatePath("/sales");
    revalidatePath("/calendar");
    revalidatePath("/calendar/day");

    return {
      success: true,
      message: "Daily sales record deleted.",
    };
  } catch (error) {
    console.error("Failed to delete daily sales record:", error);

    return {
      success: false,
      message: "Unable to delete the daily sales record.",
    };
  }
}

const updateDailySalesSchema = z.object({
  id: z.string().min(1, "Missing sales record ID"),

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

export type UpdateDailySalesState = {
  success: boolean;
  message: string;
};

export async function updateDailySales(
  previousState: UpdateDailySalesState,
  formData: FormData,
): Promise<UpdateDailySalesState> {
  await requireAdmin();
  const result = updateDailySalesSchema.safeParse({
    id: formData.get("id"),
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

  const { id, grossSales, netSales, transactionCount, notes } = result.data;

  try {
    await prisma.dailySales.update({
      where: {
        id,
      },
      data: {
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
    revalidatePath("/calendar");
    revalidatePath("/calendar/day");

    return {
      success: true,
      message: "Daily sales record updated.",
    };
  } catch (error) {
    console.error("Failed to update daily sales record:", error);

    return {
      success: false,
      message: "Unable to update the daily sales record.",
    };
  }
}
