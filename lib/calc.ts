/* ============================================================
   Cálculo de recuperación de oro para el simulador.
   Unidades: capacidad en tn/día, ley en g/t, recuperación en %.
   ============================================================ */

export const GRAMS_PER_OZT = 31.1034768;

/** Modelos con su throughput nominal en tn/h (de la línea XL). */
export const MODELS_CAP = [
  { code: "XL-25", tnH: 0.2, plano: "/planos/xl-25.pdf" },
  { code: "XL-50", tnH: 1.0, plano: "/planos/xl-50.pdf" },
  { code: "XL-75", tnH: 1.5, plano: "/planos/xl-75.pdf" },
  { code: "XL-100", tnH: 2.5, plano: "/planos/xl-100.pdf" },
] as const;

export const PERIODS = [
  { key: "day", label: "1 día", days: 1 },
  { key: "week", label: "1 semana", days: 7 },
  { key: "month", label: "1 mes", days: 30 },
  { key: "year", label: "1 año", days: 365 },
] as const;

/** Gramos de oro recuperados por día. */
export function gramsPerDay(
  capacityTnDay: number,
  gradeGt: number,
  recoveryPct: number,
): number {
  const c = Math.max(capacityTnDay, 0);
  const g = Math.max(gradeGt, 0);
  const r = Math.min(Math.max(recoveryPct, 0), 100) / 100;
  return c * g * r;
}

/** Convierte gramos de oro a USD según el precio por onza troy. */
export function gramsToUsd(grams: number, usdPerOz: number): number {
  return grams * (usdPerOz / GRAMS_PER_OZT);
}

export interface Recommendation {
  code: string;
  plano: string;
  reqTnH: number;
  unitsNeeded: number;
  needsMultiple: boolean;
}

/** Recomienda el modelo más pequeño que cubre la capacidad/día pedida. */
export function recommendModel(
  capacityTnDay: number,
  hoursPerDay: number,
): Recommendation {
  const reqTnH = capacityTnDay / Math.max(hoursPerDay, 1);
  const fit = MODELS_CAP.find((m) => m.tnH >= reqTnH - 1e-9);
  if (fit) {
    return { code: fit.code, plano: fit.plano, reqTnH, unitsNeeded: 1, needsMultiple: false };
  }
  const top = MODELS_CAP[MODELS_CAP.length - 1];
  return {
    code: top.code,
    plano: top.plano,
    reqTnH,
    unitsNeeded: Math.ceil(reqTnH / top.tnH),
    needsMultiple: true,
  };
}

const usdFmt = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const numFmt = new Intl.NumberFormat("es-PE");

/** US$ con separadores, sin decimales. */
export function fmtUsd(v: number): string {
  if (!isFinite(v)) return "—";
  return usdFmt.format(Math.round(v));
}

/** Masa de oro legible: g por debajo de 1 kg, kg por encima. */
export function fmtMass(grams: number): string {
  if (!isFinite(grams)) return "—";
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${numFmt.format(Number(kg.toFixed(kg >= 100 ? 0 : 2)))} kg`;
  }
  return `${numFmt.format(Number(grams.toFixed(grams >= 100 ? 0 : 1)))} g`;
}
