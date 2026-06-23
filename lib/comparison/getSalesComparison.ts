import { getComparableDate } from "./getComparableDate";

type SalesRecord = {
  businessDate: Date;
  grossSalesCents: number;
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
      currentSalesCents: currentRecord.grossSalesCents,
      comparableSalesCents: null,
      dollarDifferenceCents: null,
      percentageDifference: null,
    };
  }

  const dollarDifferenceCents =
    currentRecord.grossSalesCents - comparableRecord.grossSalesCents;

  const percentageDifference =
    comparableRecord.grossSalesCents === 0
      ? null
      : (dollarDifferenceCents / comparableRecord.grossSalesCents) * 100;

  return {
    currentDate: currentRecord.businessDate,
    comparableDate,
    currentSalesCents: currentRecord.grossSalesCents,
    comparableSalesCents: comparableRecord.grossSalesCents,
    dollarDifferenceCents,
    percentageDifference,
  };
}
