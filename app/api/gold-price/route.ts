import { NextResponse } from "next/server";

// Precio del oro en vivo, desde fuentes públicas gratuitas (sin API key).
// La respuesta se cachea 5 min (ISR) → como mucho 1 fetch upstream cada 5 min,
// suficiente para "tiempo real" (el spot no se mueve en segundos) y evita rate-limit.
export const revalidate = 300;

const GRAMS_PER_OZT = 31.1034768;
// Respaldo si todas las fuentes fallan (referencia, se marca como tal en la UI).
const FALLBACK_USD_PER_OZ = 2600;

async function fromGoldApi(): Promise<number | null> {
  try {
    const r = await fetch("https://api.gold-api.com/price/XAU", {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const d = await r.json();
    const px = Number(d?.price);
    return px > 0 ? px : null;
  } catch {
    return null;
  }
}

async function fromGoldPriceOrg(): Promise<number | null> {
  try {
    const r = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });
    if (!r.ok) return null;
    const d = await r.json();
    const px = Number(d?.items?.[0]?.xauPrice);
    return px > 0 ? px : null;
  } catch {
    return null;
  }
}

export async function GET() {
  let usdPerOz = FALLBACK_USD_PER_OZ;
  let source = "referencia";

  const px = (await fromGoldApi()) ?? (await fromGoldPriceOrg());
  if (px) {
    usdPerOz = px;
    source = "vivo";
  }

  return NextResponse.json({
    usdPerOz,
    usdPerGram: usdPerOz / GRAMS_PER_OZT,
    source, // "vivo" | "referencia"
    updatedAt: new Date().toISOString(),
  });
}
