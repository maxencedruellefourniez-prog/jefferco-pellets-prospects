"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CONFIDENCE_LABELS,
  FUEL_CONFIRMATION_LABELS,
  SIGNAL_LABELS,
  STATUS_LABELS,
  type EntryPoint,
  type FuelConfirmation,
  type ProspectStatus,
  type ProspectType,
  type Signal,
  type SignalConfidence,
  type SignalType,
} from "@/lib/types";

const SIGNAL_TYPES = Object.keys(SIGNAL_LABELS) as SignalType[];
const CONFIDENCE_VALUES = Object.keys(CONFIDENCE_LABELS) as SignalConfidence[];
const FUEL_VALUES = Object.keys(FUEL_CONFIRMATION_LABELS) as FuelConfirmation[];

export default function ProspectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProspectType>("industriel");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [department, setDepartment] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [currentFuel, setCurrentFuel] = useState("");
  const [fuelConfirmation, setFuelConfirmation] = useState<FuelConfirmation>("inconnu");
  const [notes, setNotes] = useState("");
  const [sourceSummary, setSourceSummary] = useState("");
  const [status, setStatus] = useState<ProspectStatus>("a_qualifier");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [entryPoints, setEntryPoints] = useState<EntryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addSignal() {
    setSignals((s) => [
      ...s,
      { type: "secteur_energivore", source: "", confidence: "indice" },
    ]);
  }
  function updateSignal(i: number, patch: Partial<Signal>) {
    setSignals((s) => s.map((sig, idx) => (idx === i ? { ...sig, ...patch } : sig)));
  }
  function removeSignal(i: number) {
    setSignals((s) => s.filter((_, idx) => idx !== i));
  }

  function addEntryPoint() {
    setEntryPoints((e) => [...e, { role: "" }]);
  }
  function updateEntryPoint(i: number, patch: Partial<EntryPoint>) {
    setEntryPoints((e) => e.map((ep, idx) => (idx === i ? { ...ep, ...patch } : ep)));
  }
  function removeEntryPoint(i: number) {
    setEntryPoints((e) => e.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!name || !sector || !city || !department || Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      setError("Merci de renseigner au minimum le nom, le secteur, la ville, le département et des coordonnées valides (latitude/longitude).");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        sector,
        city,
        postalCode: postalCode || undefined,
        department,
        lat: latNum,
        lon: lonNum,
        currentFuel: currentFuel || undefined,
        fuelConfirmation,
        notes: notes || undefined,
        sourceSummary: sourceSummary || undefined,
        status,
        signals,
        entryPoints,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erreur lors de l'enregistrement.");
      return;
    }
    const body = await res.json();
    router.push(`/prospects/${body.prospect.id}`);
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">Identité</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Nom *
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm">
            Type *
            <select value={type} onChange={(e) => setType(e.target.value as ProspectType)} className={inputClass}>
              <option value="industriel">Industriel</option>
              <option value="collectivite">Collectivité</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            Secteur d&apos;activité *
            <input value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass} placeholder="ex : Agroalimentaire — fromagerie" />
          </label>
          <label className="text-sm">
            Ville *
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm">
            Code postal
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
          </label>
          <label className="text-sm">
            Département *
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} placeholder="ex : Vosges (88)" />
          </label>
          <label className="text-sm">
            Statut
            <select value={status} onChange={(e) => setStatus(e.target.value as ProspectStatus)} className={inputClass}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Latitude *
            <input value={lat} onChange={(e) => setLat(e.target.value)} className={inputClass} placeholder="ex : 48.174" />
          </label>
          <label className="text-sm">
            Longitude *
            <input value={lon} onChange={(e) => setLon(e.target.value)} className={inputClass} placeholder="ex : 6.449" />
          </label>
        </div>
        <p className="mt-2 text-xs text-black/50">
          Pour les coordonnées, une recherche « [ville] coordonnées GPS » suffit — la précision au niveau de la commune est largement suffisante ici.
        </p>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">Situation énergétique</h2>
        <label className="mt-3 block text-sm">
          Combustible / installation actuelle connue
          <textarea value={currentFuel} onChange={(e) => setCurrentFuel(e.target.value)} rows={2} className={inputClass} />
        </label>
        <label className="mt-3 block text-sm">
          Confirmation du combustible
          <select
            value={fuelConfirmation}
            onChange={(e) => setFuelConfirmation(e.target.value as FuelConfirmation)}
            className={inputClass}
          >
            {FUEL_VALUES.map((v) => (
              <option key={v} value={v}>{FUEL_CONFIRMATION_LABELS[v]}</option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs text-black/50">
          Ne choisir « Granulés confirmés » ou « Mix » que si une source
          primaire le dit explicitement (fiche technique, exploitant,
          visite). Par défaut, laisser « Combustible non confirmé » — c&apos;est
          distinct du score, qui mesure une probabilité de conversion
          biomasse et non le combustible exact.
        </p>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black/70">
            Signaux détectés (déterminent le score)
          </h2>
          <button type="button" onClick={addSignal} className="text-sm text-[var(--brand-dark)] hover:underline">
            + Ajouter un signal
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {signals.map((signal, i) => (
            <div key={i} className="grid gap-2 rounded-lg bg-black/[0.03] p-3 sm:grid-cols-[1fr_1fr_auto]">
              <select
                value={signal.type}
                onChange={(e) => updateSignal(i, { type: e.target.value as SignalType })}
                className={inputClass + " sm:col-span-1"}
              >
                {SIGNAL_TYPES.map((t) => (
                  <option key={t} value={t}>{SIGNAL_LABELS[t]}</option>
                ))}
              </select>
              <input
                value={signal.source}
                onChange={(e) => updateSignal(i, { source: e.target.value })}
                placeholder="URL de la source"
                className={inputClass}
              />
              <button type="button" onClick={() => removeSignal(i)} className="self-center text-sm text-red-600 hover:underline">
                Retirer
              </button>
              <select
                value={signal.confidence ?? "indice"}
                onChange={(e) => updateSignal(i, { confidence: e.target.value as SignalConfidence })}
                className={inputClass}
              >
                {CONFIDENCE_VALUES.map((c) => (
                  <option key={c} value={c}>{CONFIDENCE_LABELS[c]}</option>
                ))}
              </select>
              <input
                type="number"
                value={signal.year ?? ""}
                onChange={(e) => updateSignal(i, { year: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Année (optionnel)"
                className={inputClass}
              />
              <input
                value={signal.note ?? ""}
                onChange={(e) => updateSignal(i, { note: e.target.value })}
                placeholder="Note (optionnel)"
                className={inputClass}
              />
            </div>
          ))}
          {signals.length === 0 && (
            <p className="text-sm text-black/50">Aucun signal ajouté pour l&apos;instant.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-black/70">Points d&apos;entrée</h2>
          <button type="button" onClick={addEntryPoint} className="text-sm text-[var(--brand-dark)] hover:underline">
            + Ajouter un point d&apos;entrée
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {entryPoints.map((ep, i) => (
            <div key={i} className="grid gap-2 rounded-lg bg-black/[0.03] p-3 sm:grid-cols-2">
              <input value={ep.role} onChange={(e) => updateEntryPoint(i, { role: e.target.value })} placeholder="Rôle (ex : responsable énergie)" className={inputClass} />
              <input value={ep.name ?? ""} onChange={(e) => updateEntryPoint(i, { name: e.target.value })} placeholder="Nom (si connu, sinon laisser vide)" className={inputClass} />
              <input value={ep.org ?? ""} onChange={(e) => updateEntryPoint(i, { org: e.target.value })} placeholder="Organisation" className={inputClass} />
              <input value={ep.searchUrl ?? ""} onChange={(e) => updateEntryPoint(i, { searchUrl: e.target.value })} placeholder="Lien de recherche (LinkedIn, Societe.com…)" className={inputClass} />
              <input value={ep.note ?? ""} onChange={(e) => updateEntryPoint(i, { note: e.target.value })} placeholder="Note" className={inputClass + " sm:col-span-2"} />
              <button type="button" onClick={() => removeEntryPoint(i)} className="text-left text-sm text-red-600 hover:underline sm:col-span-2">
                Retirer
              </button>
            </div>
          ))}
          {entryPoints.length === 0 && (
            <p className="text-sm text-black/50">Aucun point d&apos;entrée ajouté pour l&apos;instant.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">Sources & notes</h2>
        <label className="mt-3 block text-sm">
          Résumé des sources
          <textarea value={sourceSummary} onChange={(e) => setSourceSummary(e.target.value)} rows={2} className={inputClass} />
        </label>
        <label className="mt-3 block text-sm">
          Notes internes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
        </label>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-dark)] disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Créer le prospect"}
        </button>
      </div>
    </form>
  );
}
