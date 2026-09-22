import Link from "next/link";
import { readProspects } from "@/lib/store";
import { distanceKm, USINE } from "@/lib/geo";
import { scoreProspect } from "@/lib/scoring";
import DashboardClient from "./DashboardClient";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await readProspects();

  const rows = data.prospects
    .map((prospect) => ({
      prospect,
      breakdown: scoreProspect(prospect, data.weights),
      distance: distanceKm(prospect.lat, prospect.lon),
    }))
    .sort((a, b) => b.breakdown.score - a.breakdown.score);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--brand-dark)]">
            Prospects — Jefferco Pellets Grand Est
          </h1>
          <p className="text-sm text-black/60">
            {rows.length} prospect{rows.length > 1 ? "s" : ""} · rayon de
            300 km autour de {USINE.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/prospects/new"
            className="rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--brand-dark)]"
          >
            + Ajouter un prospect
          </Link>
          <LogoutButton />
        </div>
      </div>

      <DashboardClient
        rows={rows.map(({ prospect, breakdown, distance }) => ({
          id: prospect.id,
          name: prospect.name,
          type: prospect.type,
          sector: prospect.sector,
          city: prospect.city,
          department: prospect.department,
          status: prospect.status,
          score: breakdown.score,
          fuelConfirmation: prospect.fuelConfirmation ?? "inconnu",
          distance,
        }))}
      />
    </main>
  );
}
