import crypto from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "salesalign-admin";
const ADMIN_COOKIE_VALUE = "admin";

function getAdminSecret() {
  const secret = process.env.ADMIN_AUTH_SECRET;

  if (!secret) {
    throw new Error("ADMIN_AUTH_SECRET is not configured");
  }

  return secret;
}

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  return password;
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getAdminSecret())
    .update(value)
    .digest("hex");
}

function createSignedCookieValue(value: string) {
  return `${value}.${sign(value)}`;
}

function isValidSignedCookieValue(cookieValue: string | undefined) {
  if (!cookieValue) {
    return false;
  }

  const [value, signature] = cookieValue.split(".");

  if (!value || !signature) {
    return false;
  }

  return signature === sign(value) && value === ADMIN_COOKIE_VALUE;
}

function hashForComparison(value: string) {
  return crypto.createHash("sha256").update(value).digest();
}

export function isValidAdminPassword(password: string) {
  const submittedPasswordHash = hashForComparison(password);
  const adminPasswordHash = hashForComparison(getAdminPassword());

  return crypto.timingSafeEqual(submittedPasswordHash, adminPasswordHash);
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: createSignedCookieValue(ADMIN_COOKIE_VALUE),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return isValidSignedCookieValue(cookieValue);
}

export async function requireAdmin() {
  const isAdmin = await isAdminSession();

  if (!isAdmin) {
    throw new Error("Unauthorized admin action");
  }
}

export async function redirectIfNotAdmin(redirectTo = "/sales") {
  const isAdmin = await isAdminSession();

  if (!isAdmin) {
    redirect(`/admin/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
}
