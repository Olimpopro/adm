"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  initialLots,
  VIEWBOX,
  LIMITE_TERRENO,
  QUADRAS,
  brl,
  type Lot,
  type LotStatus,
} from "@/lib/lots";
import { LotDetail } from "./LotDetail";

type Props = { lots?: Lot[] };

const STATUS_LABEL: Record<LotStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
};

const STATUS_FILL: Record<LotStatus, string> = {
  available: "rgba(165,230,53,0.42)",
  reserved: "rgba(245,183,58,0.55)",
  sold: "rgba(60,68,90,0.55)",
};

const STATUS_STROKE: Record<LotStatus, string> = {
  available: "rgba(217,243,123,0.95)",
  reserved: "rgba(245,183,58,1)",
  sold: "rgba(107,113,135,0.85)",
};

const STATUS_HOVER: Record<LotStatus, string> = {
  available: "rgba(165,230,53,0.92)",
  reserved: "rgba(245,183,58,0.92)",
  sold: "rgba(107,113,135,0.6)",
};

export function SitePlan({ lots: lotsProp }: Props) {
  const lots = lotsProp ?? initialLots;
  const [hover, setHover] = useState<Lot | null>(null);
  const [active, setActive] = useState<Lot | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<"all" | LotStatus>("all");
  const [quadraFilter, setQuadraFilter] = useState<string>("all");

  const visibleLots = useMemo(() => {
    return lots.map((l) => {
      const visible =
        (filter === "all" || l.status === filter) &&
        (quadraFilter === "all" || l.quadra === quadraFilter);
      return { ...l, visible };
    });
  }, [lots, filter, quadraFilter]);

  const counts = useMemo(
    () => ({
      total: lots.length,
      available: lots.filter((l) => l.status === "available").length,
      reserved: lots.filter((l) => l.status === "reserved").length,
      sold: lots.filter((l) => l.status === "sold").length,
    }),
    [lots],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const onMove = useCallback((e: React.MouseEvent) => {
    setPointer({ x: e.clientX, y: e.clientY });
  }, []);

  const limitePath = LIMITE_TERRENO.map(
    (p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`,
  ).join(" ") + " Z";

  return (
    <section
      id="planta"
      className="relative w-full px-6 md:px-12 py-24 md:py-32 bg-[var(--av-navy-950)] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[55vw] h-[55vw] rounded-full blob"
        style={{ background: "radial-gradient(circle, var(--av-lime-500) 0%, transparent 60%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-60 -left-40 w-[55vw] h-[55vw] rounded-full blob"
        style={{ background: "radial-gradient(circle, var(--av-navy-600) 0%, transparent 60%)" }}
      />

      <div className="relative max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-12 items-end mb-10 md:mb-14">
          <div>
            <span className="eyebrow">02 — Planta Interativa</span>
            <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] max-w-[20ch]">
              A planta oficial, <em>navegável</em> lote por lote.
            </h2>
            <p className="mt-6 max-w-prose text-[var(--av-ink-300)] text-lg">
              Geometria extraída do projeto CAD original — 187 lotes em 11
              quadras com áreas reais e ruas nomeadas. Passe o cursor para
              ver as informações; clique para simular sua compra.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "available", "reserved", "sold"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] border transition-all ${
                  filter === k
                    ? "bg-[var(--av-lime-400)] border-[var(--av-lime-400)] text-[var(--av-navy-950)]"
                    : "border-[var(--av-ink-700)] text-[var(--av-ink-300)] hover:border-[var(--av-lime-400)] hover:text-[var(--av-lime-400)]"
                }`}
              >
                {k === "all"
                  ? `Todos · ${counts.total}`
                  : `${STATUS_LABEL[k]} · ${counts[k]}`}
              </button>
            ))}
          </div>
        </div>

        {/* Quadra chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setQuadraFilter("all")}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
              quadraFilter === "all"
                ? "bg-[var(--av-cream-50)] text-[var(--av-navy-950)]"
                : "bg-[var(--av-navy-900)] text-[var(--av-ink-300)] hover:text-[var(--av-cream-50)]"
            }`}
          >
            Todas as quadras
          </button>
          {QUADRAS.map((q) => (
            <button
              key={q.id}
              onClick={() => setQuadraFilter(quadraFilter === q.id ? "all" : q.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
                quadraFilter === q.id
                  ? "bg-[var(--av-cream-50)] text-[var(--av-navy-950)]"
                  : "bg-[var(--av-navy-900)] text-[var(--av-ink-300)] hover:text-[var(--av-cream-50)]"
              }`}
            >
              {q.id}
            </button>
          ))}
        </div>

        {/* Plan canvas */}
        <div
          className="relative w-full rounded-3xl border border-[var(--av-navy-800)] bg-gradient-to-br from-[var(--av-navy-900)] to-[var(--av-navy-950)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
            className="block w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Planta interativa do AcquaVille Residencial"
          >
            <defs>
              {/* Background gradient inside the terrain */}
              <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#162144" />
                <stop offset="100%" stopColor="#0e1734" />
              </linearGradient>
              <pattern id="dots" patternUnits="userSpaceOnUse" width="14" height="14">
                <circle cx="2" cy="2" r="0.6" fill="rgba(165,230,53,0.12)" />
              </pattern>
            </defs>

            {/* Terrain perimeter */}
            <path d={limitePath} fill="url(#grass)" stroke="#4a5687" strokeWidth="0.8" />
            <path d={limitePath} fill="url(#dots)" stroke="none" />

            {/* Lots — stagger reveal */}
            {visibleLots.map((lot, i) => (
              <motion.polygon
                key={lot.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: lot.visible ? 1 : 0.05,
                  scale: lot.visible ? 1 : 0.95,
                }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(i * 0.002, 0.4),
                  ease: [0.22, 1, 0.36, 1],
                }}
                points={lot.polygon}
                fill={STATUS_FILL[lot.status]}
                stroke={STATUS_STROKE[lot.status]}
                strokeWidth={0.8}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => lot.visible && setHover(lot)}
                onMouseLeave={() =>
                  setHover((h) => (h?.id === lot.id ? null : h))
                }
                onClick={() => {
                  if (!lot.visible) return;
                  if (lot.status === "sold") return;
                  setActive(lot);
                }}
                style={{
                  cursor:
                    lot.visible && lot.status !== "sold" ? "pointer" : "default",
                  transition: "fill 0.25s, stroke-width 0.25s",
                  transformOrigin: `${lot.cx}px ${lot.cy}px`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.setAttribute("fill", STATUS_HOVER[lot.status]);
                }}
                onMouseOut={(e) => {
                  e.currentTarget.setAttribute("fill", STATUS_FILL[lot.status]);
                }}
              />
            ))}

            {/* Lot numbers (tiny) */}
            {visibleLots.filter((l) => l.visible).map((lot) => (
              <text
                key={`n-${lot.id}`}
                x={lot.cx}
                y={lot.cy + 2}
                textAnchor="middle"
                pointerEvents="none"
                fontSize="6"
                fill="rgba(10,21,53,0.7)"
                fontFamily="var(--font-jakarta)"
                fontWeight="600"
              >
                {lot.number}
              </text>
            ))}

            {/* Quadra labels */}
            {QUADRAS.map((q) => (
              <g key={q.id} pointerEvents="none">
                <rect
                  x={q.cx - 28}
                  y={q.cy - 12}
                  width="56"
                  height="24"
                  rx="12"
                  fill="rgba(250,247,240,0.96)"
                />
                <text
                  x={q.cx}
                  y={q.cy + 4}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#0a1535"
                  fontFamily="var(--font-jakarta)"
                  fontWeight="700"
                  letterSpacing="1"
                >
                  {q.id}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="px-4 md:px-8 py-5 border-t border-[var(--av-navy-800)] bg-[var(--av-navy-900)]/80 backdrop-blur flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[var(--av-ink-300)]">
            <Legend swatchClass="bg-[var(--av-lime-500)]/60 border-[var(--av-lime-500)]" label="Disponível" />
            <Legend swatchClass="bg-[#f5b73a]/60 border-[#f5b73a]" label="Reservado" />
            <Legend swatchClass="bg-[#3c445a]/60 border-[#6b7187]" label="Vendido" />
            <span className="ml-auto eyebrow text-[var(--av-lime-400)]">
              {counts.available} de {counts.total} disponíveis
            </span>
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hover && !active && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-50 px-5 py-4 rounded-2xl bg-[var(--av-cream-50)] text-[var(--av-navy-950)] shadow-2xl min-w-[260px]"
            style={{ left: pointer.x + 18, top: pointer.y + 18 }}
          >
            <div className="eyebrow text-[var(--av-navy-700)]">
              {hover.quadra} · Lote {String(hover.number).padStart(2, "0")}
            </div>
            <div className="mt-2 display text-2xl leading-none">
              {brl.format(hover.price)}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-[var(--av-ink-700)]">
              <Field label="Área" value={`${hover.area} m²`} />
              <Field label="Frente" value={`${hover.frente} m`} />
              <Field label="Fundo" value={`${hover.fundo} m`} />
            </div>
            {hover.viaFrente && (
              <div className="mt-3 text-[10px] uppercase tracking-widest text-[var(--av-navy-700)]">
                <span className="opacity-50">Frente para </span>
                <span className="font-medium normal-case tracking-normal text-[var(--av-navy-900)]">
                  {hover.viaFrente}
                </span>
              </div>
            )}
            <div className="mt-3 text-[10px] uppercase tracking-widest font-medium">
              {hover.status === "available" && (
                <span className="text-[var(--av-lime-600)]">Clique para simular ↗</span>
              )}
              {hover.status === "reserved" && (
                <span className="text-[#b07a00]">Reservado</span>
              )}
              {hover.status === "sold" && (
                <span className="text-[var(--av-ink-500)]">Vendido</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && <LotDetail lot={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function Legend({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-5 rounded-sm border ${swatchClass}`} />
      {label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="opacity-50">{label}</div>
      <div className="font-medium normal-case text-[var(--av-navy-900)] text-base tracking-normal">
        {value}
      </div>
    </div>
  );
}
