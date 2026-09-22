"use client";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        fetch("/api/auth/logout", { method: "POST" }).then(() => {
          window.location.href = "/login";
        });
      }}
      className="rounded-md border border-black/15 px-3 py-2 text-sm text-black/70 hover:bg-black/5"
    >
      Déconnexion
    </button>
  );
}
