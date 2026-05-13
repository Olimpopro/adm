"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import {
  initialLots,
  PLANTA,
  brl,
  QUADRAS,
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

const STATUS_COLOR: Record<LotStatus, string> = {
  available: "rgba(165,230,53,0.42)",
  reserved: "rgba(245,183,58,0.55)",
  sold: "rgba(60,68,90,0.55)",
};

const STATUS_STROKE: Record<LotStatus, string> = {
  available: "rgba(217,243,123,0.95)",
  reserved: "rgba(245,183,58,1)",
  sold: "rgba(107,113,135,0.9)",
};

export function SitePlan({ lots: lotsProp }: Props) {
  const lots = lotsProp ?? initialLots;
  const [hover, setHover] = useState<Lot | null>(null);
  const [active, setActive] = useState<Lot | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<"all" | LotStatus>("all");
  const [quadraFilter, setQuadraFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return lots.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (quadraFilter !== "all" && l.quadra !== quadraFilter) return false;
      return true;
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const onMove = useCallback((e: React.MouseEvent) => {
    setPointer({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <section
      id="planta"
      className="relative w-full px-6 md:px-12 py-24 md:py-32 bg-[var(--av-navy-950)] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[55vw] h-[55vw] rounded-full blob"
        style={{
          background:
            "radial-gradient(circle, var(--av-lime-500) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-60 -left-40 w-[55vw] h-[55vw] rounded-full blob"
        style={{
          background:
            "radial-gradient(circle, var(--av-navy-600) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-12 items-end mb-10 md:mb-14">
          <div>
            <span className="eyebrow">02 — Planta Interativa</span>
            <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] max-w-[20ch]">
              A planta real, <em>navegável</em> lote por lote.
            </h2>
            <p className="mt-6 max-w-prose text-[var(--av-ink-300)] text-lg">
              A imagem abaixo é a planta original do AcquaVille, registrada
              em cartório. Passe o cursor sobre qualquer lote em verde para
              ver os dados; clique para simular sua compra.
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
              key={q}
              onClick={() => setQuadraFilter(quadraFilter === q ? "all" : q)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
                quadraFilter === q
                  ? "bg-[var(--av-cream-50)] text-[var(--av-navy-950)]"
                  : "bg-[var(--av-navy-900)] text-[var(--av-ink-300)] hover:text-[var(--av-cream-50)]"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Planta canvas */}
        <div
          className="relative w-full rounded-3xl border border-[var(--av-navy-800)] bg-[var(--av-cream-50)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <div
            className="relative w-full"
            style={{ aspectRatio: PLANTA.aspectRatio }}
          >
            {/* Real planta as background */}
            <Image
              src={PLANTA.src}
              alt="Planta do AcquaVille Residencial"
              fill
              priority
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-contain"
            />

            {/* Hotspot layer */}
            <div className="absolute inset-0">
              {filtered.map((lot, i) => (
                <motion.button
                  key={lot.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(i * 0.003, 0.5),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ scale: 1.08, zIndex: 10 }}
                  style={{
                    left: `${lot.x * 100}%`,
                    top: `${lot.y * 100}%`,
                    width: `${lot.w * 100}%`,
                    height: `${lot.h * 100}%`,
                    background: STATUS_COLOR[lot.status],
                    border: `1.5px solid ${STATUS_STROKE[lot.status]}`,
                    transformOrigin: "center",
                  }}
                  onMouseEnter={() => setHover(lot)}
                  onMouseLeave={() => setHover((h) => (h?.id === lot.id ? null : h))}
                  onClick={() => (lot.status !== "sold" ? setActive(lot) : null)}
                  disabled={lot.status === "sold"}
                  className={`absolute rounded-[3px] cursor-pointer transition-colors duration-300 hover:brightness-110 ${
                    lot.status === "available"
                      ? "hover:shadow-[0_0_18px_rgba(165,230,53,0.7)]"
                      : ""
                  } ${lot.status === "sold" ? "cursor-not-allowed" : ""}`}
                  aria-label={`Lote ${lot.id} — ${STATUS_LABEL[lot.status]}`}
                />
              ))}
            </div>

            {/* Quadra labels overlay */}
            {QUADRAS.map((q) => {
              const inQ = lots.filter((l) => l.quadra === q);
              if (inQ.length === 0) return null;
              const cx =
                inQ.reduce((s, l) => s + l.x + l.w / 2, 0) / inQ.length;
              const cy =
                inQ.reduce((s, l) => s + l.y + l.h / 2, 0) / inQ.length;
              return (
                <div
                  key={q}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${cx * 100}%`, top: `${cy * 100}%` }}
                >
                  <span className="px-2 py-0.5 rounded-full bg-[var(--av-navy-950)]/85 text-[var(--av-cream-50)] text-[10px] tracking-[0.2em] uppercase font-medium">
                    {q}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend bar */}
          <div className="px-4 md:px-8 py-5 border-t border-black/10 bg-[var(--av-cream-100)] flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[var(--av-navy-900)]">
            <Legend swatchClass="bg-[var(--av-lime-500)]/60 border-[var(--av-lime-500)]" label="Disponível" />
            <Legend swatchClass="bg-[#f5b73a]/60 border-[#f5b73a]" label="Reservado" />
            <Legend swatchClass="bg-[#3c445a]/60 border-[#6b7187]" label="Vendido" />
            <span className="ml-auto eyebrow text-[var(--av-sand-500)]">
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
            className="pointer-events-none fixed z-50 px-5 py-4 rounded-2xl bg-[var(--av-cream-50)] text-[var(--av-navy-950)] shadow-2xl min-w-[240px]"
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

      {/* Detail modal */}
      <AnimatePresence>
        {active && <LotDetail lot={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function Legend({
  swatchClass, label,
}: { swatchClass: string; label: string }) {
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
