"use client";

export function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/admin/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded border px-4 py-2 font-medium"
    >
      Logout
    </button>
  );
}
