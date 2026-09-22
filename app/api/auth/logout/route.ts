import { ADMIN_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `${ADMIN_COOKIE}=; Path=/; Max-Age=0`);
  return res;
}
