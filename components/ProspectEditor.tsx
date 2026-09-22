"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FUEL_CONFIRMATION_LABELS,
  STATUS_LABELS,
  type FuelConfirmation,
  type Prospect,
  type ProspectStatus,
} from "@/lib/types";

const FUEL_VALUES = Object.keys(FUEL_CONFIRMATION_LABELS) as FuelConfirmation[];

export default function ProspectEditor({ prospect }: { prospect: Prospect }) {
  const router = useRouter();
  const [status, setStatus] = useState<ProspectStatus>(prospect.status);
  const [fuelConfirmation, setFuelConfirmation] = useState<FuelConfirmation>(
    prospect.fuelConfirmation ?? "inconnu",
  );
  const [notes, setNotes] = useState(prospect.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/prospects/${prospect.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, fuelConfirmation, notes }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Supprimer « ${prospect.name} » ? Cette action est définitive.`))
      return;
    const res = await fetch(`/api/prospects/${prospect.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <h2 className="text-sm font-semibold text-black/70">
        Mettre à jour le suivi
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Statut
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProspectStatus)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Confirmation du combustible
          <select
            value={fuelConfirmation}
            onChange={(e) => setFuelConfirmation(e.target.value as FuelConfirmation)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
          >
            {FUEL_VALUES.map((v) => (
              <option key={v} value={v}>
                {FUEL_CONFIRMATION_LABELS[v]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 block text-sm">
        Notes internes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex justify-between">
        <button
          onClick={remove}
          className="text-sm text-red-600 hover:underline"
          type="button"
        >
          Supprimer ce prospect
        </button>
        <button
          onClick={save}
          disabled={saving}
          type="button"
          className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-dark)] disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
