/**
 * AcquaVille Residencial — lot model
 *
 * Lots are auto-detected from the real Civil 3D planta PDF using OpenCV
 * (green-mask + divider subtraction + KMeans clustering into 11 quadras).
 * The detection result lives in lots-detected.json and is the source of
 * truth for geometry. We enrich each lot with business data (price,
 * frente/fundo, status) at load time.
 */

import detected from "./lots-detected.json";

export type LotStatus = "available" | "reserved" | "sold";

export type Lot = {
  id: string;
  quadra: string;
  number: number;
  area: number;        // m²
  frente: number;      // m
  fundo: number;       // m
  price: number;       // BRL
  status: LotStatus;
  /** normalized 0..1 coords on the cropped planta image */
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Cropped planta image metadata (px in original high-res render) */
export const PLANTA = {
  src: "/planta.jpg",
  /** the cropped pixel dimensions — used by the viewer as aspect ratio */
  width: detected.crop.w,
  height: detected.crop.h,
  aspectRatio: detected.crop.w / detected.crop.h,
};

const BASE_PRICE_PER_M2 = 480;
const PREMIUM_BUMP = 1.18;

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickStatus(seed: number): LotStatus {
  const r = seededRandom(seed);
  if (r < 0.62) return "available";
  if (r < 0.82) return "reserved";
  return "sold";
}

type DetectedLot = (typeof detected.lots)[number];

function isCornerLot(lot: DetectedLot, idx: number, all: DetectedLot[]): boolean {
  const sameQ = all.filter((l) => l.quadra === lot.quadra);
  if (sameQ.length === 0) return false;
  const xs = sameQ.map((l) => l.x);
  const ys = sameQ.map((l) => l.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const eps = 0.01;
  return (
    Math.abs(lot.x - minX) < eps ||
    Math.abs(lot.x - maxX) < eps ||
    Math.abs(lot.y - minY) < eps ||
    Math.abs(lot.y - maxY) < eps
  );
}

function buildLots(): Lot[] {
  return detected.lots.map((d, i) => {
    const seed = i * 11 + 7;
    const frente = +(Math.sqrt(d.area / 2.2)).toFixed(1);
    const fundo = +(d.area / frente).toFixed(1);
    const corner = isCornerLot(d, i, detected.lots);
    const price = Math.round((d.area * BASE_PRICE_PER_M2 * (corner ? PREMIUM_BUMP : 1)) / 1000) * 1000;
    return {
      id: d.id,
      quadra: d.quadra,
      number: d.number,
      area: d.area,
      frente,
      fundo,
      price,
      status: pickStatus(seed),
      x: d.x,
      y: d.y,
      w: d.w,
      h: d.h,
    } satisfies Lot;
  });
}

export const initialLots: Lot[] = buildLots();

export const QUADRAS: string[] = Array.from(
  new Set(initialLots.map((l) => l.quadra)),
).sort();

export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const totals = {
  total: initialLots.length,
  available: initialLots.filter((l) => l.status === "available").length,
  reserved: initialLots.filter((l) => l.status === "reserved").length,
  sold: initialLots.filter((l) => l.status === "sold").length,
};
