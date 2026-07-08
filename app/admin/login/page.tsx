import { redirect } from "next/navigation";

import {
  createAdminSession,
  isAdminSession,
  isValidAdminPassword,
} from "@/lib/auth/admin";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

function getSafeRedirectPath(redirectTo: string | undefined) {
  if (!redirectTo) {
    return "/sales";
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/sales";
  }

  return redirectTo;
}

async function loginAdmin(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");
  const safeRedirectPath = getSafeRedirectPath(redirectTo);

  if (!isValidAdminPassword(password)) {
    redirect(
      `/admin/login?error=1&redirectTo=${encodeURIComponent(safeRedirectPath)}`,
    );
  }

  await createAdminSession();

  redirect(safeRedirectPath);
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const safeRedirectPath = getSafeRedirectPath(params.redirectTo);

  const isAdmin = await isAdminSession();

  if (isAdmin) {
    redirect(safeRedirectPath);
  }

  const hasError = params.error === "1";

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-bold">Admin Login</h1>

      <p className="mt-2 text-gray-600">
        Sign in to import, edit, or delete sales records.
      </p>

      <form
        action={loginAdmin}
        className="mt-8 grid gap-4 rounded-lg border p-6"
      >
        <input type="hidden" name="redirectTo" value={safeRedirectPath} />

        <div>
          <label htmlFor="password" className="mb-1 block font-medium">
            Admin password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        {hasError ? (
          <p className="text-sm text-red-600">Incorrect admin password.</p>
        ) : null}

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 font-medium text-white"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
