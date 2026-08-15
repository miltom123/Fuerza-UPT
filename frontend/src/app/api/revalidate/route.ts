import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

const allowedTags = new Set([
  "home", "representation", "projects", "events", "opportunities", "team", "statistics",
  "polls", "site-settings",
]);

function matchesSecret(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  if (!matchesSecret(request.headers.get("x-revalidation-secret"), process.env.REVALIDATION_SECRET)) {
    return Response.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: string[] } | null;
  const tags = [...new Set(body?.tags ?? [])].filter((tag) => allowedTags.has(tag));
  if (!tags.length) {
    return Response.json({ message: "No se recibieron etiquetas válidas." }, { status: 400 });
  }

  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  return Response.json({ revalidated: tags });
}
