/**
 * AcquaVille Residencial — exact lot model from the DWG.
 *
 * Sourced from the official Civil 3D DWG (CONDOMINIO AGUA VILE_10072025.dwg)
 * via libredwg → dxf → ezdxf, reading each NUMLOTE block's attributes:
 *   - QUADRA, NULOTE, AREALT, PERIME
 *   - MEDFRE / MEDFUN / MEDDIR / MEDESQ (dimensions)
 *   - SITFRE / SITFUN (front/back roads)
 *   - PTX1/PTY1..PTX8/PTY8 (exact polygon vertices)
 *
 * All coordinates are projected into a stable SVG viewBox (W x H) with the
 * Y axis flipped to match SVG convention.
 */

import sitePlan from "./site-plan.json";

export type LotStatus = "available" | "reserved" | "sold";

export type Lot = {
  id: string;          // e.g. "Q-01-L01"
  quadra: string;      // e.g. "Q-01"
  number: number;
  area: number;        // m²
  perimeter: number;   // m
  frente: number;      // m
  fundo: number;       // m
  viaFrente: string;
  viaFundo: string;
  /** SVG polygon points string, e.g. "505.5,1091.5 495,1064.3 ..." */
  polygon: string;
  /** Bounding box of the polygon for tooltip anchoring */
  cx: number;
  cy: number;
  price: number;       // BRL
  status: LotStatus;
};

export type Quadra = { id: string; cx: number; cy: number };

export type POIIcon = "sun" | "ball" | "wave" | "glass" | "tree";

export type POI = {
  id: string;
  label: string;
  description: string;
  polygon: string;       // SVG points string
  cx: number;
  cy: number;
  icon: POIIcon;
};

export const VIEWBOX = sitePlan.viewBox as { w: number; h: number };

export const LIMITE_TERRENO: number[][] = sitePlan.limite;

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

type RawLot = (typeof sitePlan.lots)[number];

function isCorner(lot: RawLot): boolean {
  // Premium: corner lots and lots facing the highway / common areas
  const street = (lot.via_frente ?? "").toLowerCase();
  return (
    street.includes("juraci") ||
    street.includes("área de lazer") ||
    street.includes("rotunda") ||
    lot.frente_m >= 14
  );
}

function buildLots(): Lot[] {
  return sitePlan.lots.map((d: RawLot, i: number) => {
    const seed = i * 11 + 7;
    const corner = isCorner(d);
    const price = Math.round((d.area * BASE_PRICE_PER_M2 * (corner ? PREMIUM_BUMP : 1)) / 1000) * 1000;
    return {
      id: d.id,
      quadra: d.quadra,
      number: d.number,
      area: d.area,
      perimeter: d.perimeter,
      frente: d.frente_m,
      fundo: d.fundo_m,
      viaFrente: d.via_frente,
      viaFundo: d.via_fundo,
      polygon: d.polygon.map((p: number[]) => `${p[0]},${p[1]}`).join(" "),
      cx: d.cx,
      cy: d.cy,
      price,
      status: pickStatus(seed),
    } satisfies Lot;
  });
}

export const initialLots: Lot[] = buildLots();

export const QUADRAS: Quadra[] = Object.entries(sitePlan.quadras).map(
  ([id, c]: [string, { cx: number; cy: number }]) => ({ id, cx: c.cx, cy: c.cy }),
).sort((a, b) => a.id.localeCompare(b.id));

type RawPOI = {
  id: string;
  label: string;
  description: string;
  polygon: number[][];
  cx: number;
  cy: number;
  icon: string;
};

export const POIS: POI[] = (sitePlan.pois as RawPOI[]).map((p) => ({
  id: p.id,
  label: p.label,
  description: p.description,
  polygon: p.polygon.map((pt) => `${pt[0]},${pt[1]}`).join(" "),
  cx: p.cx,
  cy: p.cy,
  icon: p.icon as POIIcon,
}));

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
