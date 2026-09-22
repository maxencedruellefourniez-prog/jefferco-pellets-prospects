"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erreur inconnue.");
      return;
    }
    router.push(params.get("from") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl border border-black/10 bg-white p-6 shadow-sm"
    >
      <div>
        <h1 className="text-lg font-semibold text-[var(--brand-dark)]">
          Prospects Pellets
        </h1>
        <p className="text-sm text-black/60">
          Jefferco Pellets Grand Est — accès réservé
        </p>
      </div>
      <input
        type="password"
        autoFocus
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
