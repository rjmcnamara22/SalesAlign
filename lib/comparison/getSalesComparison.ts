import { getComparableDate } from "./getComparableDate";

type SalesRecord = {
  businessDate: Date;
  salesTotalCents: number;
};

export type SalesComparison = {
  currentDate: Date;
  comparableDate: Date;
  currentSalesCents: number;
  comparableSalesCents: number | null;
  dollarDifferenceCents: number | null;
  percentageDifference: number | null;
};

export function getSalesComparison(
  currentRecord: SalesRecord,
  comparableRecord: SalesRecord | null,
): SalesComparison {
  const comparableDate = getComparableDate(currentRecord.businessDate);

  if (!comparableRecord) {
    return {
      currentDate: currentRecord.businessDate,
      comparableDate,
      currentSalesCents: currentRecord.salesTotalCents,
      comparableSalesCents: null,
      dollarDifferenceCents: null,
      percentageDifference: null,
    };
  }

  const dollarDifferenceCents =
    currentRecord.salesTotalCents - comparableRecord.salesTotalCents;

  const percentageDifference =
    comparableRecord.salesTotalCents === 0
      ? null
      : (dollarDifferenceCents / comparableRecord.salesTotalCents) * 100;

  return {
    currentDate: currentRecord.businessDate,
    comparableDate,
    currentSalesCents: currentRecord.salesTotalCents,
    comparableSalesCents: comparableRecord.salesTotalCents,
    dollarDifferenceCents,
    percentageDifference,
  };
}
