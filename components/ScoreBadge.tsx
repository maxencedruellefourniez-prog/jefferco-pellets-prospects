import { scoreTier } from "@/lib/scoring";
import { FUEL_CONFIRMATION_LABELS, type FuelConfirmation } from "@/lib/types";

export default function ScoreBadge({ score }: { score: number }) {
  const tier = scoreTier(score);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tier.className}`}
    >
      {score}/100 · {tier.label}
    </span>
  );
}

const FUEL_BADGE_CLASS: Record<FuelConfirmation, string> = {
  granules: "bg-emerald-100 text-emerald-800",
  mixte: "bg-amber-100 text-amber-800",
  plaquettes: "bg-orange-100 text-orange-800",
  inconnu: "bg-black/[0.06] text-black/60",
};

export function FuelBadge({ fuel = "inconnu" }: { fuel?: FuelConfirmation }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${FUEL_BADGE_CLASS[fuel]}`}
    >
      {FUEL_CONFIRMATION_LABELS[fuel]}
    </span>
  );
}
