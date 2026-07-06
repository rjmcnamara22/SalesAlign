import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "salesalign-admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
