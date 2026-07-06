import { redirect } from "next/navigation";

import { clearAdminSession } from "@/lib/auth/admin";

export async function GET() {
  await clearAdminSession();

  redirect("/");
}
