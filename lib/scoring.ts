import type { Prospect, Signal, SignalConfidence, SignalType } from "./types";
import { CONFIDENCE_MULTIPLIERS, SIGNAL_WEIGHTS } from "./types";

export type ScoreBreakdown = {
  score: number;
  contributions: {
    type: SignalType;
    label: string;
    points: number;
    confidence: SignalConfidence;
  }[];
};

const CONFIDENCE_RANK: Record<SignalConfidence, number> = {
  confirme: 2,
  indice: 1,
  a_verifier: 0,
};

// Un signal vieux de plus de 5 ans perd progressivement du poids (l'équipement
// ou le combustible a pu changer depuis) : décroissance linéaire jusqu'à 60%
// de sa valeur à 15 ans, puis plafond.
function recencyMultiplier(year: number | undefined, referenceYear: number) {
  if (!year) return 1;
  const age = referenceYear - year;
  if (age <= 5) return 1;
  if (age >= 15) return 0.6;
  return 1 - ((age - 5) / 10) * 0.4;
}

/**
 * Score de probabilité qu'un prospect ait converti (ou envisage de convertir)
 * une partie de ses besoins de chaleur à la biomasse : somme des poids des
 * signaux distincts détectés, chacun pondéré par la fiabilité de sa source
 * (`confidence`) et par son ancienneté, plafonnée à 100.
 *
 * Ce score ne dit RIEN sur le combustible exact (granulés vs plaquettes) —
 * voir `prospect.fuelConfirmation` pour ça, volontairement séparé : un score
 * élevé peut très bien correspondre à un site 100% plaquettes.
 */
export function scoreProspect(
  prospect: Prospect,
  weights: Record<SignalType, number> = SIGNAL_WEIGHTS,
  referenceYear: number = new Date().getFullYear(),
): ScoreBreakdown {
  const bestByType = new Map<SignalType, Signal>();
  for (const signal of prospect.signals) {
    const current = bestByType.get(signal.type);
    const confidence = signal.confidence ?? "indice";
    if (!current || CONFIDENCE_RANK[confidence] > CONFIDENCE_RANK[current.confidence ?? "indice"]) {
      bestByType.set(signal.type, signal);
    }
  }

  const contributions: ScoreBreakdown["contributions"] = [];
  for (const [type, signal] of bestByType) {
    const confidence = signal.confidence ?? "indice";
    const base = weights[type] ?? 0;
    const points = Math.round(
      base * CONFIDENCE_MULTIPLIERS[confidence] * recencyMultiplier(signal.year, referenceYear),
    );
    contributions.push({ type, label: signalLabel(type), points, confidence });
  }

  contributions.sort((a, b) => b.points - a.points);
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
