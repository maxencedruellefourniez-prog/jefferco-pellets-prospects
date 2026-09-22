import type { Prospect, SignalType } from "./types";
import { SIGNAL_WEIGHTS } from "./types";

export type ScoreBreakdown = {
  score: number;
  contributions: { type: SignalType; label: string; points: number }[];
};

/**
 * Score de probabilité qu'un prospect dispose déjà (ou envisage) d'une
 * chaudière biomasse : somme des poids des signaux distincts détectés,
 * plafonnée à 100. Un même type de signal ne compte qu'une fois même s'il
 * apparaît plusieurs années de suite (ex : lauréat BCIAT 2016 et 2019).
 * La distance à l'usine n'entre pas dans ce score : c'est un critère de
 * priorisation commerciale séparé, pas un indicateur de probabilité.
 */
export function scoreProspect(
  prospect: Prospect,
  weights: Record<SignalType, number> = SIGNAL_WEIGHTS,
): ScoreBreakdown {
  const seen = new Set<SignalType>();
  const contributions: ScoreBreakdown["contributions"] = [];

  for (const signal of prospect.signals) {
    if (seen.has(signal.type)) continue;
    seen.add(signal.type);
    contributions.push({
      type: signal.type,
      label: signalLabel(signal.type),
      points: weights[signal.type] ?? 0,
    });
  }

  const rawScore = contributions.reduce((sum, c) => sum + c.points, 0);
  return { score: Math.min(100, rawScore), contributions };
}

function signalLabel(type: SignalType): string {
  return (
    {
      bciat: "Lauréat BCIAT",
      bcib: "Lauréat BCIB",
      reseau_chaleur_biomasse: "Réseau de chaleur biomasse",
      icpe_combustion_biomasse: "ICPE combustion biomasse",
      irep_biomasse: "IREP biomasse",
      cee_biomasse: "CEE chaudière biomasse",
      presse_conversion: "Conversion signalée en presse",
      secteur_energivore: "Secteur énergivore",
    } satisfies Record<SignalType, string>
  )[type];
}

export function scoreTier(score: number): {
  label: string;
  className: string;
} {
  if (score >= 60) return { label: "Fort", className: "score-high" };
  if (score >= 30) return { label: "Moyen", className: "score-medium" };
  return { label: "Faible", className: "score-low" };
}
