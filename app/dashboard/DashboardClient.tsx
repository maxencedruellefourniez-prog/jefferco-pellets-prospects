"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ScoreBadge from "@/components/ScoreBadge";
import { STATUS_LABELS, type ProspectStatus, type ProspectType } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  type: ProspectType;
  sector: string;
  city: string;
  department: string;
  status: ProspectStatus;
  score: number;
  distance: number;
};

export default function DashboardClient({ rows }: { rows: Row[] }) {
  const [typeFilter, setTypeFilter] = useState<"tous" | ProspectType>("tous");
  const [statusFilter, setStatusFilter] = useState<"tous" | ProspectStatus>("tous");
  const [maxDistance, setMaxDistance] = useState(300);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (typeFilter !== "tous" && row.type !== typeFilter) return false;
      if (statusFilter !== "tous" && row.status !== statusFilter) return false;
      if (row.distance > maxDistance) return false;
      if (
        search &&
        !`${row.name} ${row.city} ${row.sector}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rows, typeFilter, statusFilter, maxDistance, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-black/10 bg-white p-4">
        <input
          type="text"
          placeholder="Rechercher (nom, ville, secteur)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[220px] flex-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="tous">Tous types</option>
          <option value="industriel">Industriels</option>
          <option value="collectivite">Collectivités</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-md border border-black/15 px-3 py-2 text-sm"
        >
          <option value="tous">Tous statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-black/70">
          Distance max : {maxDistance} km
          <input
            type="range"
            min={10}
            max={300}
            step={10}
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-black/60">
            <tr>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Secteur</th>
              <th className="px-4 py-3 font-medium">Localisation</th>
              <th className="px-4 py-3 font-medium">Distance</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-t border-black/5 hover:bg-black/[0.02]"
              >
                <td className="px-4 py-3">
                  <ScoreBadge score={row.score} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/prospects/${row.id}`}
                    className="font-medium text-[var(--brand-dark)] hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-black/70">
                  {row.type === "industriel" ? "Industriel" : "Collectivité"}
                </td>
                <td className="px-4 py-3 text-black/70">{row.sector}</td>
                <td className="px-4 py-3 text-black/70">
                  {row.city} · {row.department}
                </td>
                <td className="px-4 py-3 text-black/70">{row.distance} km</td>
                <td className="px-4 py-3 text-black/70">
                  {STATUS_LABELS[row.status]}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-black/50">
                  Aucun prospect ne correspond à ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
