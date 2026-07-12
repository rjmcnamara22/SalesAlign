"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/database/prisma";

import { requireAdmin } from "@/lib/auth/admin";

const requiredCurrencySchema = z
  .preprocess((value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return value;
  }, z.string())
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, {
    message: "Sales total is required",
  })
  .refine((value) => Number.isFinite(Number(value)), {
    message: "Sales total must be a valid number",
  })
  .transform((value) => Number(value))
  .refine((value) => value >= 0, {
    message: "Sales total cannot be negative",
  });

const optionalCurrencySchema = z
  .preprocess((value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return value;
  }, z.string())
  .transform((value) => value.trim())
  .refine((value) => value === "" || Number.isFinite(Number(value)), {
    message: "Net sales must be a valid number",
  })
  .transform((value) => (value === "" ? "" : Number(value)))
  .refine((value) => value === "" || value >= 0, {
    message: "Net sales cannot be negative",
  });

const optionalTransactionCountSchema = z
  .preprocess((value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return value;
  }, z.string())
  .transform((value) => value.trim())
  .refine((value) => value === "" || Number.isInteger(Number(value)), {
    message: "Transaction count must be a whole number",
  })
  .transform((value) => (value === "" ? "" : Number(value)))
  .refine((value) => value === "" || value >= 0, {
    message: "Transaction count cannot be negative",
  });

const dailySalesSchema = z.object({
  businessDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid business date"),

  salesTotal: requiredCurrencySchema,

  netSales: optionalCurrencySchema.optional(),

  transactionCount: optionalTransactionCountSchema.optional(),

  notes: z.string().trim().max(500).optional(),
});

export type CreateDailySalesState = {
  success: boolean;
  message: string;
};

export async function createDailySales(
  _previousState: CreateDailySalesState,
  formData: FormData,
): Promise<CreateDailySalesState> {
  await requireAdmin();

  const result = dailySalesSchema.safeParse({
    businessDate: formData.get("businessDate"),
    salesTotal: formData.get("salesTotal"),
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

  const { businessDate, salesTotal, netSales, transactionCount, notes } =
    result.data;

  try {
    await prisma.dailySales.create({
      data: {
        businessDate: new Date(`${businessDate}T00:00:00.000Z`),
        salesTotalCents: Math.round(salesTotal * 100),
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
  _previousState: DeleteDailySalesState,
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

  salesTotal: requiredCurrencySchema,

  netSales: optionalCurrencySchema.optional(),

  transactionCount: optionalTransactionCountSchema.optional(),

  notes: z.string().trim().max(500).optional(),
});

export type UpdateDailySalesState = {
  success: boolean;
  message: string;
};

export async function updateDailySales(
  _previousState: UpdateDailySalesState,
  formData: FormData,
): Promise<UpdateDailySalesState> {
  await requireAdmin();
  const result = updateDailySalesSchema.safeParse({
    id: formData.get("id"),
    salesTotal: formData.get("salesTotal"),
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

  const { id, salesTotal, netSales, transactionCount, notes } = result.data;

  try {
    await prisma.dailySales.update({
      where: {
        id,
      },
      data: {
        salesTotalCents: Math.round(salesTotal * 100),
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

export async function updateDailySalesNotes(formData: FormData) {
  await requireAdmin();

  const recordId = String(formData.get("recordId") ?? "");
  const notesValue = String(formData.get("notes") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/calendar");

  if (!recordId) {
    throw new Error("Missing record ID");
  }

  await prisma.dailySales.update({
    where: {
      id: recordId,
    },
    data: {
      notes: notesValue.length > 0 ? notesValue : null,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/calendar/day");

  redirect(returnTo);
}
