import Link from "next/link";
import { notFound } from "next/navigation";
import { readProspects } from "@/lib/store";
import { distanceKm, USINE } from "@/lib/geo";
import { scoreProspect } from "@/lib/scoring";
import ScoreBadge, { FuelBadge } from "@/components/ScoreBadge";
import { CONFIDENCE_LABELS, SIGNAL_LABELS, STATUS_LABELS } from "@/lib/types";
import ProspectEditor from "@/components/ProspectEditor";

export const dynamic = "force-dynamic";

export default async function ProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await readProspects();
  const prospect = data.prospects.find((p) => p.id === id);
  if (!prospect) notFound();

  const breakdown = scoreProspect(prospect, data.weights);
  const distance = distanceKm(prospect.lat, prospect.lon);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-black/60 hover:underline">
        ← Retour au tableau de bord
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--brand-dark)]">
            {prospect.name}
          </h1>
          <p className="text-sm text-black/60">
            {prospect.sector} · {prospect.city} ({prospect.department}) ·{" "}
            {distance} km de {USINE.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ScoreBadge score={breakdown.score} />
          <FuelBadge fuel={prospect.fuelConfirmation} />
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">
          Détail du score de probabilité
        </h2>
        <p className="mt-1 text-xs text-black/50">
          Somme des signaux détectés, pondérée par la fiabilité de la source et
          l&apos;ancienneté du signal, plafonnée à 100. Ce score mesure une
          probabilité de conversion biomasse — <strong>pas</strong> une
          confirmation du combustible : voir le badge combustible ci-dessus,
          qui reste volontairement séparé du score.
        </p>
        <ul className="mt-3 space-y-2">
          {breakdown.contributions.map((c) => (
            <li
              key={c.type}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {SIGNAL_LABELS[c.type]}
                <span className="ml-2 text-xs text-black/40">
                  {CONFIDENCE_LABELS[c.confidence]}
                </span>
              </span>
              <span className="font-medium text-[var(--brand-dark)]">
                +{c.points}
              </span>
            </li>
          ))}
          {breakdown.contributions.length === 0 && (
            <li className="text-sm text-black/50">Aucun signal enregistré.</li>
          )}
        </ul>
      </section>

      {prospect.currentFuel && (
        <section className="mt-4 rounded-xl border border-black/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-black/70">
            Situation énergétique connue
          </h2>
          <p className="mt-2 text-sm text-black/80">{prospect.currentFuel}</p>
        </section>
      )}

      <section className="mt-4 rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">
          Point(s) d&apos;entrée suggéré(s)
        </h2>
        <div className="mt-3 space-y-3">
          {prospect.entryPoints.map((ep, i) => (
            <div key={i} className="rounded-lg bg-black/[0.03] p-3 text-sm">
              <p className="font-medium">
                {ep.name ? `${ep.name} — ` : ""}
                {ep.role}
              </p>
              {ep.org && <p className="text-black/60">{ep.org}</p>}
              {ep.note && <p className="mt-1 text-black/60">{ep.note}</p>}
              {ep.searchUrl && (
                <a
                  href={ep.searchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-[var(--brand-dark)] hover:underline"
                >
                  Rechercher un contact →
                </a>
              )}
            </div>
          ))}
          {prospect.entryPoints.length === 0 && (
            <p className="text-sm text-black/50">
              Aucun point d&apos;entrée identifié pour l&apos;instant.
            </p>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">Sources</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-black/70">
          {prospect.sourceSummary || "Non renseigné."}
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-black/70">
          Statut actuel : {STATUS_LABELS[prospect.status]}
        </h2>
        {prospect.notes && (
          <p className="mt-2 text-sm text-black/70">{prospect.notes}</p>
        )}
      </section>

      <section className="mt-6">
        <ProspectEditor prospect={prospect} />
      </section>
    </main>
  );
}
