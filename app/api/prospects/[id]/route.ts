import { readProspects, writeProspects } from "@/lib/store";
import type { Prospect } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const data = await readProspects();
  const prospect = data.prospects.find((p) => p.id === id);
  if (!prospect) {
    return Response.json({ error: "Prospect introuvable." }, { status: 404 });
  }
  return Response.json(prospect);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Partial<Prospect> | null;
  if (!body) {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const data = await readProspects();
  const index = data.prospects.findIndex((p) => p.id === id);
  if (index === -1) {
    return Response.json({ error: "Prospect introuvable." }, { status: 404 });
  }

  const updated: Prospect = { ...data.prospects[index], ...body, id };
  data.prospects[index] = updated;

  try {
    await writeProspects(data, `Mise à jour du prospect ${updated.name}`);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, prospect: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const data = await readProspects();
  const index = data.prospects.findIndex((p) => p.id === id);
  if (index === -1) {
    return Response.json({ error: "Prospect introuvable." }, { status: 404 });
  }
  const [removed] = data.prospects.splice(index, 1);

  try {
    await writeProspects(data, `Suppression du prospect ${removed.name}`);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
