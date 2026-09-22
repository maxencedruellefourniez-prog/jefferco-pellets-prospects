import { scoreTier } from "@/lib/scoring";

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
