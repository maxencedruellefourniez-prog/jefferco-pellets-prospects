import { ADMIN_COOKIE, adminPassword, createSession, matchesPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const password = adminPassword();
  if (!password) {
    return Response.json(
      { error: "PELLETS_ADMIN_PASSWORD n'est pas configuré côté serveur." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const candidate = typeof body?.password === "string" ? body.password : "";

  if (!candidate || !matchesPassword(candidate, password)) {
    return Response.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const session = createSession(password);
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${session.value}; Path=/; Max-Age=${session.maxAge}; HttpOnly; SameSite=Lax`,
  );
  return res;
}
