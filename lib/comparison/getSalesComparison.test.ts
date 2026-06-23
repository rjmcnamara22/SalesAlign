import { describe, expect, it } from "vitest";

import { getSalesComparison } from "./getSalesComparison";

describe("getSalesComparison", () => {
  it("calculates dollar and percentage differences", () => {
    const result = getSalesComparison(
      {
        businessDate: new Date(2026, 5, 30),
        grossSalesCents: 120000,
      },
      {
        businessDate: new Date(2025, 6, 1),
        grossSalesCents: 100000,
      },
    );

    expect(result.dollarDifferenceCents).toBe(20000);
    expect(result.percentageDifference).toBe(20);
  });

  it("returns null comparison values when no prior record exists", () => {
    const result = getSalesComparison(
      {
        businessDate: new Date(2026, 5, 30),
        grossSalesCents: 120000,
      },
      null,
    );

    expect(result.comparableSalesCents).toBeNull();
    expect(result.dollarDifferenceCents).toBeNull();
    expect(result.percentageDifference).toBeNull();
  });

  it("avoids division by zero", () => {
    const result = getSalesComparison(
      {
        businessDate: new Date(2026, 5, 30),
        grossSalesCents: 120000,
      },
      {
        businessDate: new Date(2025, 6, 1),
        grossSalesCents: 0,
      },
    );

    expect(result.percentageDifference).toBeNull();
  });
});
