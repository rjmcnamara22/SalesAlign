import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { prisma } from "@/lib/database/prisma";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthDateRange(year: number, monthIndex: number) {
  const startDate = new Date(Date.UTC(year, monthIndex, 1));
  const endDate = new Date(Date.UTC(year, monthIndex + 1, 1));

  return {
    startDate,
    endDate,
  };
}

export default async function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();

  const { startDate, endDate } = getMonthDateRange(year, monthIndex);

  const salesRecords = await prisma.dailySales.findMany({
    where: {
      businessDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    select: {
      businessDate: true,
      grossSalesCents: true,
    },
    orderBy: {
      businessDate: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div>
        <p className="text-sm font-medium text-gray-500">Sales calendar</p>

        <h1 className="text-3xl font-bold">
          {MONTH_NAMES[monthIndex]} {year}
        </h1>

        <p className="mt-2 text-gray-600">
          Daily gross sales displayed in a monthly calendar layout.
        </p>
      </div>

      <CalendarGrid
        year={year}
        monthIndex={monthIndex}
        salesRecords={salesRecords}
      />
    </main>
  );
}
