import { LAUNCH_IMAGE_MAX_BYTES, PUMP_NAME_MAX, PUMP_SYMBOL_MAX } from "@/lib/launch";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  const incoming = await req.formData();
  const file = incoming.get("file");
  const name = String(incoming.get("name") ?? "").trim();
  const symbol = String(incoming.get("symbol") ?? "").trim().toUpperCase();
  const description = String(incoming.get("description") ?? "").trim();
  const website = String(incoming.get("website") ?? "").trim();
  const twitter = String(incoming.get("twitter") ?? "").trim();
  const telegram = String(incoming.get("telegram") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Image file required.", 400);
  }
  if (file.size > LAUNCH_IMAGE_MAX_BYTES) {
    return jsonError("Image must be 4MB or smaller.", 400);
  }
  if (!name || name.length > PUMP_NAME_MAX) {
    return jsonError(`Name is required (${PUMP_NAME_MAX} characters max).`, 400);
  }
  if (!symbol || symbol.length > PUMP_SYMBOL_MAX) {
    return jsonError(`Ticker is required (${PUMP_SYMBOL_MAX} characters max).`, 400);
  }

  const upstream = new FormData();
  upstream.append("file", file, file.name || "coin.png");
  upstream.append("name", name);
  upstream.append("symbol", symbol);
  upstream.append(
    "description",
    description || `${name} ($${symbol}) launched on Sweep. 80% of creator fees mop the floor.`,
  );
  upstream.append("twitter", twitter);
  upstream.append("telegram", telegram);
  upstream.append("website", website);
  upstream.append("showName", "true");

  const res = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: upstream,
    headers: { Accept: "application/json" },
  });
  const raw = await res.text();
  if (!res.ok) {
    return jsonError(
      `Metadata upload failed (${res.status}): ${raw.slice(0, 180) || res.statusText}`,
      502,
    );
  }

  let parsed: { metadataUri?: string; uri?: string; metadata?: { image?: string } };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    return jsonError("pump.fun returned a non-JSON metadata response.", 502);
  }

  const uri = parsed.metadataUri || parsed.uri;
  if (!uri) {
    return jsonError("pump.fun did not return a metadata URI.", 502);
  }

  return NextResponse.json({ uri, image: parsed.metadata?.image ?? null });
}
