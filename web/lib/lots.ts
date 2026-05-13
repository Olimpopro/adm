/**
 * AcquaVille Residencial — site plan model
 *
 * The PDF planta (Autodesk Civil 3D) shows an L-shaped loteamento with
 * a central rotunda, 11 quadras (Q-01..Q-11), and access from BA-172.
 * We translate the planta into a normalized 1200x900 SVG viewBox.
 * Coordinates are stylized for clarity at web scale, not surveyor-accurate.
 */

export type LotStatus = "available" | "reserved" | "sold";
export type Orientation = "north" | "south" | "east" | "west";

export type Lot = {
  id: string;
  quadra: string;
  number: number;
  area: number;        // m²
  frente: number;      // m (frontage)
  fundo: number;       // m (depth)
  orientation: Orientation;
  price: number;       // BRL
  status: LotStatus;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Quadra = {
  id: string;
  label: string;
  origin: { x: number; y: number };
  cols: number;
  rows: number;
  lotW: number;
  lotH: number;
  orientation: Orientation;
  /** rotation angle in degrees applied to the whole block */
  rotate?: number;
};

const BASE_PRICE_PER_M2 = 480; // BRL — entry tier
const PREMIUM_BUMP = 1.18;     // for lots facing parks / rotunda / corner

// 11 quadras laid out to echo the L-shape of the real planta.
// Top-left: long vertical "leg" of the L (Q-11)
// Bottom: horizontal base of the L with the rotunda at center.
export const quadras: Quadra[] = [
  // The vertical leg (upper "foot" of the L)
  { id: "Q-11", label: "Quadra 11", origin: { x: 215, y: 90 }, cols: 2, rows: 19, lotW: 26, lotH: 16, orientation: "east" },

  // Northern row above central area
  { id: "Q-06", label: "Quadra 6", origin: { x: 480, y: 230 }, cols: 8, rows: 1, lotW: 28, lotH: 32, orientation: "south" },
  { id: "Q-09", label: "Quadra 9", origin: { x: 480, y: 320 }, cols: 4, rows: 2, lotW: 30, lotH: 30, orientation: "north" },
  { id: "Q-08", label: "Quadra 8", origin: { x: 620, y: 320 }, cols: 4, rows: 2, lotW: 30, lotH: 30, orientation: "north" },
  { id: "Q-10", label: "Quadra 10", origin: { x: 760, y: 320 }, cols: 4, rows: 2, lotW: 30, lotH: 30, orientation: "north" },

  // Middle band — flanking the rotunda
  { id: "Q-07", label: "Quadra 7", origin: { x: 360, y: 440 }, cols: 3, rows: 3, lotW: 30, lotH: 28, orientation: "east" },
  { id: "Q-05", label: "Quadra 5", origin: { x: 830, y: 440 }, cols: 3, rows: 3, lotW: 30, lotH: 28, orientation: "west" },

  // Southern band below rotunda
  { id: "Q-03", label: "Quadra 3", origin: { x: 480, y: 600 }, cols: 4, rows: 2, lotW: 30, lotH: 30, orientation: "south" },
  { id: "Q-02", label: "Quadra 2", origin: { x: 620, y: 600 }, cols: 4, rows: 2, lotW: 30, lotH: 30, orientation: "south" },
  { id: "Q-04", label: "Quadra 4", origin: { x: 760, y: 600 }, cols: 4, rows: 2, lotW: 30, lotH: 30, orientation: "south" },

  // BA-172 frontage row (bottom strip facing the highway)
  { id: "Q-01", label: "Quadra 1", origin: { x: 480, y: 740 }, cols: 14, rows: 1, lotW: 28, lotH: 38, orientation: "south" },
];

const QUADRA_ORDER = quadras.map((q) => q.id);

function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickStatus(seed: number): LotStatus {
  const r = seededRandom(seed);
  if (r < 0.62) return "available";
  if (r < 0.82) return "reserved";
  return "sold";
}

export function buildLots(): Lot[] {
  const lots: Lot[] = [];
  let globalSeed = 7;

  for (const q of quadras) {
    let n = 1;
    for (let row = 0; row < q.rows; row++) {
      for (let col = 0; col < q.cols; col++) {
        const x = q.origin.x + col * q.lotW;
        const y = q.origin.y + row * q.lotH;
        const area = Math.round((q.lotW * q.lotH) * 0.42 + (globalSeed % 80));
        const frente = +(q.lotW * 0.46).toFixed(2);
        const fundo = +(area / frente).toFixed(2);
        const isCorner = col === 0 || col === q.cols - 1 || row === 0 || row === q.rows - 1;
        const premium = isCorner ? PREMIUM_BUMP : 1;
        const price = Math.round((area * BASE_PRICE_PER_M2 * premium) / 1000) * 1000;

        lots.push({
          id: `${q.id}-L${String(n).padStart(2, "0")}`,
          quadra: q.id,
          number: n,
          area,
          frente,
          fundo,
          orientation: q.orientation,
          price,
          status: pickStatus(globalSeed),
          x,
          y,
          w: q.lotW,
          h: q.lotH,
        });
        n++;
        globalSeed += 11;
      }
    }
  }
  return lots;
}

export const initialLots: Lot[] = buildLots();

export const totals = {
  total: initialLots.length,
  available: initialLots.filter((l) => l.status === "available").length,
  reserved: initialLots.filter((l) => l.status === "reserved").length,
  sold: initialLots.filter((l) => l.status === "sold").length,
};

export function getQuadraById(id: string): Quadra | undefined {
  return quadras.find((q) => q.id === id);
}

export { QUADRA_ORDER };

/** Site plan viewBox dimensions */
export const SITE_VIEWBOX = { width: 1200, height: 900 };

/** Pretty BRL formatter */
export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
