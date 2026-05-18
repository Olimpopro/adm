/**
 * AcquaVille Residencial — site plan in image-pixel coordinates.
 *
 * The base image `web/public/planta-base.jpg` is rendered directly from
 * the CAD DWG (matplotlib) using the SAME projection as the markers.
 * Result: zero alignment drift between background and clickable lots.
 */

import sitePlan from "./site-plan.json";

export type LotStatus = "available" | "reserved" | "sold";

export type Lot = {
  id: string;
  quadra: string;
  number: number;
  area: number;
  perimeter: number;
  frente: number;
  fundo: number;
  viaFrente: string;
  viaFundo: string;
  x: number;          // pixel position on the base image
  y: number;
  xFrac: number;
  yFrac: number;
  price: number;
  status: LotStatus;
};

export type POIIcon = "sun" | "ball" | "wave" | "glass" | "tree";

export type POI = {
  id: string;
  label: string;
  description: string;
  icon: POIIcon;
  x: number;
  y: number;
  xFrac: number;
  yFrac: number;
};

export const IMAGE = sitePlan.image as { src: string; w: number; h: number };

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
type RawPOI = (typeof sitePlan.pois)[number];

function isCorner(lot: RawLot): boolean {
  const street = (lot.viaFrente ?? "").toLowerCase();
  return (
    street.includes("juraci") ||
    street.includes("área de lazer") ||
    street.includes("rotunda") ||
    (lot.frente ?? 0) >= 14
  );
}

export const initialLots: Lot[] = (sitePlan.lots as RawLot[]).map((d, i) => {
  const seed = i * 11 + 7;
  const corner = isCorner(d);
  const price = Math.round(
    (d.area * BASE_PRICE_PER_M2 * (corner ? PREMIUM_BUMP : 1)) / 1000,
  ) * 1000;
  return {
    id: d.id,
    quadra: d.quadra,
    number: d.number,
    area: d.area,
    perimeter: d.perimeter,
    frente: d.frente,
    fundo: d.fundo,
    viaFrente: d.viaFrente,
    viaFundo: d.viaFundo,
    x: d.x,
    y: d.y,
    xFrac: d.x_frac,
    yFrac: d.y_frac,
    price,
    status: pickStatus(seed),
  } satisfies Lot;
});

export const POIS: POI[] = (sitePlan.pois as RawPOI[]).map((p) => ({
  id: p.id,
  label: p.label,
  description: p.description,
  icon: p.icon as POIIcon,
  x: p.x,
  y: p.y,
  xFrac: p.x_frac,
  yFrac: p.y_frac,
}));

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
