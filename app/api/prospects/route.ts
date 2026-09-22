import { readProspects, writeProspects } from "@/lib/store";
import type { Prospect } from "@/lib/types";

export async function GET() {
  const data = await readProspects();
  return Response.json(data);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isValidProspect(body: unknown): body is Omit<Prospect, "id"> {
  if (typeof body !== "object" || body === null) return false;
  const p = body as Partial<Prospect>;
  return (
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    (p.type === "industriel" || p.type === "collectivite") &&
    typeof p.sector === "string" &&
    typeof p.city === "string" &&
    typeof p.department === "string" &&
    typeof p.lat === "number" &&
    typeof p.lon === "number" &&
    Array.isArray(p.signals) &&
    Array.isArray(p.entryPoints)
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isValidProspect(body)) {
    return Response.json({ error: "Prospect invalide." }, { status: 400 });
  }

  const data = await readProspects();
  const baseId = slugify(`${body.name}-${body.city}`);
  let id = baseId;
  let i = 2;
  while (data.prospects.some((p) => p.id === id)) {
    id = `${baseId}-${i}`;
    i += 1;
  }

  const prospect: Prospect = { ...body, id, status: body.status ?? "a_qualifier" };
  data.prospects.push(prospect);

  try {
    await writeProspects(data, `Ajout du prospect ${prospect.name}`);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, prospect });
}
