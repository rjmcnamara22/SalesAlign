"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/database/prisma";

const dailySalesSchema = z.object({
  businessDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid business date"),
  grossSales: z.coerce.number().min(0, "Gross sales cannot be negative"),
  netSales: z.coerce.number().min(0, "Net sales cannot be negative").optional(),
  transactionCount: z.coerce
    .number()
    .int("Transaction count must be a whole number")
    .min(0, "Transaction count cannot be negative")
    .optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function createDailySales(formData: FormData) {
  const rawData = {
    businessDate: formData.get("businessDate"),
    grossSales: formData.get("grossSales"),
    netSales: formData.get("netSales") || undefined,
    transactionCount: formData.get("transactionCount") || undefined,
    notes: formData.get("notes") || undefined,
  };

  const result = dailySalesSchema.safeParse(rawData);

  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid sales data");
  }

  const { businessDate, grossSales, netSales, transactionCount, notes } =
    result.data;

  await prisma.dailySales.create({
    data: {
      businessDate: new Date(`${businessDate}T00:00:00.000Z`),
      grossSalesCents: Math.round(grossSales * 100),
      netSalesCents: netSales === undefined ? null : Math.round(netSales * 100),
      transactionCount: transactionCount ?? null,
      notes: notes || null,
    },
  });

  revalidatePath("/sales");
}
