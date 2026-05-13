"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  initialLots,
  quadras,
  brl,
  SITE_VIEWBOX,
  type Lot,
  type LotStatus,
} from "@/lib/lots";
import { LotDetail } from "./LotDetail";

type Props = {
  /** optional override (when admin updates statuses, server passes the merged list) */
  lots?: Lot[];
};

const STATUS_LABEL: Record<LotStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
};

export function SitePlan({ lots: lotsProp }: Props) {
  const lots = lotsProp ?? initialLots;
  const [hover, setHover] = useState<Lot | null>(null);
  const [active, setActive] = useState<Lot | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<"all" | LotStatus>("all");

  const filtered = useMemo(
    () => (filter === "all" ? lots : lots.filter((l) => l.status === filter)),
    [lots, filter],
  );

  const counts = useMemo(() => {
    return {
      total: lots.length,
      available: lots.filter((l) => l.status === "available").length,
      reserved: lots.filter((l) => l.status === "reserved").length,
      sold: lots.filter((l) => l.status === "sold").length,
    };
  }, [lots]);

  // Close on Escape
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  const onLotMove = useCallback((e: React.MouseEvent) => {
    setPointer({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <section
      id="planta"
      className="relative w-full px-6 md:px-12 py-24 md:py-32 bg-[var(--av-navy-950)] overflow-hidden"
    >
      {/* Ambient atmosphere */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[60vw] h-[60vw] rounded-full blob"
        style={{ background: "radial-gradient(circle, var(--av-lime-500) 0%, transparent 60%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-60 -left-40 w-[55vw] h-[55vw] rounded-full blob"
        style={{ background: "radial-gradient(circle, var(--av-navy-600) 0%, transparent 60%)" }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-12 items-end mb-12 md:mb-16">
          <div>
            <span className="eyebrow">02 — Planta Interativa</span>
            <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] max-w-[18ch]">
              Escolha seu lote <em>passeando</em> pelo bairro.
            </h2>
            <p className="mt-6 max-w-prose text-[var(--av-ink-300)] text-lg">
              Cada quadrado abaixo é um lote real do AcquaVille. Passe o cursor
              para ver área, frente e valor. Clique para abrir a ficha e
              simular sua compra.
            </p>
          </div>

          {/* Status filters */}
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

        {/* The SVG */}
        <div
          className="relative w-full rounded-3xl border border-[var(--av-navy-800)] bg-gradient-to-br from-[var(--av-navy-900)] to-[var(--av-navy-950)] p-4 md:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          onMouseMove={onLotMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${SITE_VIEWBOX.width} ${SITE_VIEWBOX.height}`}
            className="w-full h-auto"
            role="img"
            aria-label="Planta interativa do AcquaVille Residencial"
          >
            {/* Background streets */}
            <defs>
              <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#7a8294" strokeWidth="1" opacity="0.18" />
              </pattern>
              <radialGradient id="rotunda" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#a5e635" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#a5e635" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Street network (rough) */}
            <g stroke="#2a3148" strokeWidth="2" fill="none">
              {/* Vertical spine on the leg */}
              <rect x="270" y="80" width="38" height="340" fill="#13182b" stroke="none" />
              {/* Horizontal main avenue */}
              <rect x="270" y="420" width="700" height="22" fill="#13182b" stroke="none" />
              {/* Vertical between Q-09 and Q-08 */}
              <rect x="600" y="240" width="22" height="200" fill="#13182b" stroke="none" />
              <rect x="740" y="240" width="22" height="200" fill="#13182b" stroke="none" />
              {/* Vertical between south quadras */}
              <rect x="600" y="560" width="22" height="180" fill="#13182b" stroke="none" />
              <rect x="740" y="560" width="22" height="180" fill="#13182b" stroke="none" />
              {/* Avenue around rotunda */}
              <rect x="270" y="540" width="700" height="22" fill="#13182b" stroke="none" />
              {/* BA-172 frontage */}
              <rect x="270" y="780" width="700" height="20" fill="#13182b" stroke="none" />
            </g>

            {/* Rotunda */}
            <g>
              <circle cx="690" cy="540" r="42" fill="url(#rotunda)" />
              <circle cx="690" cy="540" r="22" fill="#0a1535" stroke="#a5e635" strokeWidth="1" />
              <circle cx="690" cy="540" r="8" fill="#a5e635" opacity="0.7" />
              <text
                x="690"
                y="610"
                textAnchor="middle"
                fill="#a5e635"
                fontSize="11"
                letterSpacing="3"
                fontFamily="var(--font-jakarta)"
              >
                ROTUNDA
              </text>
            </g>

            {/* BA-172 label */}
            <g>
              <line
                x1="270"
                y1="828"
                x2="970"
                y2="828"
                stroke="#a5e635"
                strokeWidth="0.6"
                strokeDasharray="4 6"
                opacity="0.5"
              />
              <text
                x="620"
                y="850"
                textAnchor="middle"
                fill="#a5acbf"
                fontSize="10"
                letterSpacing="6"
                fontFamily="var(--font-jakarta)"
              >
                RODOVIA  BA-172
              </text>
            </g>

            {/* Lots */}
            {filtered.map((lot, i) => {
              const isVisible =
                filter === "all" || lot.status === filter;
              const opacity = isVisible ? 1 : 0.08;
              return (
                <motion.rect
                  key={lot.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(i * 0.004, 0.6),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  x={lot.x}
                  y={lot.y}
                  width={lot.w - 2}
                  height={lot.h - 2}
                  rx={2}
                  className={`lot-${lot.status}`}
                  onMouseEnter={() => setHover(lot)}
                  onMouseLeave={() => setHover((h) => (h?.id === lot.id ? null : h))}
                  onClick={() =>
                    lot.status !== "sold" ? setActive(lot) : null
                  }
                />
              );
            })}

            {/* Quadra labels */}
            {quadras.map((q) => {
              const cx = q.origin.x + (q.cols * q.lotW) / 2;
              const cy = q.origin.y + (q.rows * q.lotH) / 2;
              return (
                <g key={q.id} pointerEvents="none">
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="#0a1535"
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="var(--font-jakarta)"
                    style={{ paintOrder: "stroke", stroke: "#faf7f0", strokeWidth: 3, strokeLinejoin: "round" }}
                  >
                    {q.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[var(--av-ink-300)]">
            <Legend swatchClass="bg-[var(--av-lime-500)]" label="Disponível" />
            <Legend swatchClass="bg-[#f5b73a]" label="Reservado" />
            <Legend swatchClass="bg-[#6b7187]" label="Vendido" />
            <span className="ml-auto eyebrow text-[var(--av-ink-500)]">
              {counts.available} de {counts.total} disponíveis
            </span>
          </div>
        </div>
      </div>

      {/* Floating hover tooltip */}
      <AnimatePresence>
        {hover && !active && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-50 px-5 py-4 rounded-2xl bg-[var(--av-cream-50)] text-[var(--av-navy-950)] shadow-2xl min-w-[220px] backdrop-blur"
            style={{
              left: pointer.x + 18,
              top: pointer.y + 18,
            }}
          >
            <div className="eyebrow text-[var(--av-navy-700)]">
              {hover.quadra} · Lote {String(hover.number).padStart(2, "0")}
            </div>
            <div className="mt-2 display text-2xl leading-none">
              {brl.format(hover.price)}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-[var(--av-ink-700)]">
              <div>
                <div className="opacity-50">Área</div>
                <div className="font-medium normal-case text-[var(--av-navy-900)] text-base tracking-normal">
                  {hover.area} m²
                </div>
              </div>
              <div>
                <div className="opacity-50">Frente</div>
                <div className="font-medium normal-case text-[var(--av-navy-900)] text-base tracking-normal">
                  {hover.frente} m
                </div>
              </div>
              <div>
                <div className="opacity-50">Fundo</div>
                <div className="font-medium normal-case text-[var(--av-navy-900)] text-base tracking-normal">
                  {hover.fundo} m
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-widest font-medium">
              {hover.status === "available" && (
                <span className="text-[var(--av-lime-600)]">
                  Clique para simular ↗
                </span>
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

      {/* Detail modal */}
      <AnimatePresence>
        {active && (
          <LotDetail lot={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function Legend({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-2.5 w-4 rounded-sm ${swatchClass}`} />
      {label}
    </span>
  );
}
