import Link from "next/link";
import ProspectForm from "@/components/ProspectForm";

export default function NewProspectPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-black/60 hover:underline">
        ← Retour au tableau de bord
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-[var(--brand-dark)]">
        Ajouter un prospect
      </h1>
      <p className="mt-1 text-sm text-black/60">
        Le score est calculé automatiquement à partir des signaux que vous
        renseignez ci-dessous.
      </p>
      <div className="mt-6">
        <ProspectForm />
      </div>
    </main>
  );
}
