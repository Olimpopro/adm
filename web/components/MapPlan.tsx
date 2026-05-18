"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  initialLots,
  IMAGE,
  POIS,
  QUADRAS,
  brl,
  type Lot,
  type LotStatus,
  type POI,
} from "@/lib/lots";
import { LotDetail } from "./LotDetail";
import { AreaDetail } from "./AreaDetail";
import { AnimatePresence } from "motion/react";
import type { AreaPhotos } from "@/lib/photos";

type Props = { lots?: Lot[]; areaPhotos?: AreaPhotos };

const STATUS_LABEL: Record<LotStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
};

const STATUS_BG: Record<LotStatus, string> = {
  available: "#a5e635",
  reserved: "#f5b73a",
  sold: "#9aa0b3",
};

export function MapPlan({ lots: lotsProp, areaPhotos = {} }: Props) {
  const lots = lotsProp ?? initialLots;

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lotLayerRef = useRef<L.LayerGroup | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);

  const [filter, setFilter] = useState<"all" | LotStatus>("all");
  const [quadraFilter, setQuadraFilter] = useState<string>("all");
  const [activeLot, setActiveLot] = useState<Lot | null>(null);
  const [activePoi, setActivePoi] = useState<POI | null>(null);

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
    if (!mapDivRef.current || mapRef.current) return;

    const bounds: L.LatLngBoundsLiteral = [
      [0, 0],
      [IMAGE.h, IMAGE.w],
    ];

    const map = L.map(mapDivRef.current, {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 3,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120,
      attributionControl: false,
      zoomControl: true,
      maxBounds: [
        [-IMAGE.h * 0.15, -IMAGE.w * 0.15],
        [IMAGE.h * 1.15, IMAGE.w * 1.15],
      ],
      maxBoundsViscosity: 0.85,
    });
    map.zoomControl.setPosition("bottomright");

    L.imageOverlay(IMAGE.src, bounds, { interactive: false }).addTo(map);
    map.fitBounds(bounds, { padding: [20, 20] });

    lotLayerRef.current = L.layerGroup().addTo(map);
    poiLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = lotLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    lots.forEach((lot) => {
      const visible =
        (filter === "all" || lot.status === filter) &&
        (quadraFilter === "all" || lot.quadra === quadraFilter);
      if (!visible) return;

      const bg = STATUS_BG[lot.status];
      const disabled = lot.status === "sold";

      const icon = L.divIcon({
        className: "av-lot-marker",
        html: `<button class="av-lot-pill" data-status="${lot.status}"
                 ${disabled ? "disabled" : ""}
                 style="--bg:${bg};"
                 aria-label="Lote ${lot.id} — ${STATUS_LABEL[lot.status]}"
               >${lot.number}</button>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([IMAGE.h - lot.y, lot.x], {
        icon,
        keyboard: !disabled,
        riseOnHover: true,
        bubblingMouseEvents: false,
      });

      const tooltip = `
        <div class="av-tip">
          <div class="av-tip-eyebrow">${lot.quadra} · Lote ${String(lot.number).padStart(2, "0")}</div>
          <div class="av-tip-price">${brl.format(lot.price)}</div>
          <div class="av-tip-grid">
            <span>Área</span><b>${lot.area} m²</b>
            <span>Frente</span><b>${lot.frente} m</b>
            <span>Fundo</span><b>${lot.fundo} m</b>
          </div>
          ${lot.viaFrente
            ? `<div class="av-tip-street">Frente para <b>${escapeHtml(lot.viaFrente)}</b></div>`
            : ""}
          <div class="av-tip-cta" data-status="${lot.status}">
            ${lot.status === "available" ? "Toque para simular" :
              lot.status === "reserved" ? "Reservado" : "Vendido"}
          </div>
        </div>`;
      marker.bindTooltip(tooltip, {
        direction: "top", offset: [0, -8], opacity: 1, className: "av-tooltip",
      });

      if (!disabled) marker.on("click", () => setActiveLot(lot));
      marker.addTo(layer);
    });
  }, [lots, filter, quadraFilter]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = poiLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    POIS.forEach((p) => {
      const photos = areaPhotos[p.id] ?? [];
      const icon = L.divIcon({
        className: "av-poi-marker",
        html: `<button class="av-poi-pill" aria-label="${escapeHtml(p.label)}">
                 ${poiSvg(p.icon)}
                 <span class="av-poi-label">${escapeHtml(p.label)}</span>
                 ${photos.length ? `<span class="av-poi-count">${photos.length}</span>` : ""}
               </button>`,
        iconSize: [54, 54],
        iconAnchor: [27, 27],
      });
      const marker = L.marker([IMAGE.h - p.y, p.x], { icon, zIndexOffset: 200 });
      marker.on("click", () => setActivePoi(p));
      marker.addTo(layer);
    });
  }, [areaPhotos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || quadraFilter === "all") return;
    const inQ = lots.filter((l) => l.quadra === quadraFilter);
    if (inQ.length === 0) return;
    const xs = inQ.map((l) => l.x);
    const ys = inQ.map((l) => l.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 60;
    map.flyToBounds(
      [
        [IMAGE.h - maxY - pad, minX - pad],
        [IMAGE.h - minY + pad, maxX + pad],
      ],
      { duration: 0.7 },
    );
  }, [quadraFilter, lots]);

  return (
    <section
      id="planta"
      className="relative w-full px-4 md:px-12 py-24 md:py-32 bg-[var(--av-navy-950)] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[55vw] h-[55vw] rounded-full blob"
        style={{
          background:
            "radial-gradient(circle, var(--av-lime-500) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-12 items-end mb-8 md:mb-12">
          <div>
            <span className="eyebrow">02 — Planta Interativa</span>
            <h2 className="display mt-4 text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.95] max-w-[22ch]">
              Navegue pela planta como em um <em>mapa</em>.
            </h2>
            <p className="mt-5 max-w-prose text-[var(--av-ink-300)] text-base md:text-lg">
              Arraste pra mover, pinça pra dar zoom. Cada esfera é um lote
              real — toque pra ver os dados e simular sua compra.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "available", "reserved", "sold"] as const).map((k) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.18em] border transition-all ${
                  filter === k
                    ? "bg-[var(--av-lime-400)] border-[var(--av-lime-400)] text-[var(--av-navy-950)]"
                    : "border-[var(--av-ink-700)] text-[var(--av-ink-300)] hover:border-[var(--av-lime-400)] hover:text-[var(--av-lime-400)]"
                }`}>
                {k === "all" ? `Todos · ${counts.total}` : `${STATUS_LABEL[k]} · ${counts[k]}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <button onClick={() => setQuadraFilter("all")}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
              quadraFilter === "all"
                ? "bg-[var(--av-cream-50)] text-[var(--av-navy-950)]"
                : "bg-[var(--av-navy-900)] text-[var(--av-ink-300)] hover:text-[var(--av-cream-50)]"
            }`}>
            Todas as quadras
          </button>
          {QUADRAS.map((q) => (
            <button key={q} onClick={() => setQuadraFilter(quadraFilter === q ? "all" : q)}
              className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
                quadraFilter === q
                  ? "bg-[var(--av-cream-50)] text-[var(--av-navy-950)]"
                  : "bg-[var(--av-navy-900)] text-[var(--av-ink-300)] hover:text-[var(--av-cream-50)]"
              }`}>
              {q}
            </button>
          ))}
        </div>

        <div className="relative rounded-3xl border border-[var(--av-navy-800)] bg-[var(--av-cream-100)] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <div ref={mapDivRef} className="w-full" style={{ height: "min(78vh, 820px)" }} />
          <div className="px-4 md:px-8 py-4 border-t border-[var(--av-navy-800)] bg-[var(--av-navy-900)] flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[var(--av-ink-300)]">
            <Legend bg="#a5e635" label={`Disponível · ${counts.available}`} />
            <Legend bg="#f5b73a" label={`Reservado · ${counts.reserved}`} />
            <Legend bg="#9aa0b3" label={`Vendido · ${counts.sold}`} />
            <span className="ml-auto eyebrow text-[var(--av-lime-400)] hidden md:inline">
              Arraste · Pinça pra zoom
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeLot && <LotDetail lot={activeLot} onClose={() => setActiveLot(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activePoi && (
          <AreaDetail
            poi={activePoi}
            photos={areaPhotos[activePoi.id] ?? []}
            onClose={() => setActivePoi(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Legend({ bg, label }: { bg: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded-full border border-[var(--av-navy-900)]"
        style={{ background: bg, boxShadow: "0 0 0 1.5px rgba(255,255,255,0.45)" }} />
      {label}
    </span>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function poiSvg(icon: POI["icon"]): string {
  const stroke = "stroke='#0a1535' stroke-width='1.6' fill='none' stroke-linecap='round' stroke-linejoin='round'";
  if (icon === "sun") {
    return `<svg viewBox='-15 -15 30 30' width='20' height='20'>
      <circle r='5' ${stroke} />
      <g ${stroke}>
        ${[0,45,90,135,180,225,270,315].map(a => {
          const r1 = 9, r2 = 13;
          const x1 = r1*Math.cos(a*Math.PI/180), y1 = r1*Math.sin(a*Math.PI/180);
          const x2 = r2*Math.cos(a*Math.PI/180), y2 = r2*Math.sin(a*Math.PI/180);
          return `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' />`;
        }).join("")}
      </g></svg>`;
  }
  if (icon === "ball") {
    return `<svg viewBox='-12 -12 24 24' width='20' height='20'>
      <circle r='7.5' ${stroke} />
      <path d='M-7.5 0 Q0 -3 7.5 0' ${stroke} />
      <path d='M-7.5 0 Q0 3 7.5 0' ${stroke} />
      <line x1='0' y1='-7.5' x2='0' y2='7.5' ${stroke} /></svg>`;
  }
  if (icon === "wave") {
    return `<svg viewBox='-12 -12 24 24' width='20' height='20'>
      <path d='M-9 -2 Q-4 -6 0 -2 T9 -2' ${stroke} />
      <path d='M-9 3 Q-4 -1 0 3 T9 3' ${stroke} /></svg>`;
  }
  if (icon === "glass") {
    return `<svg viewBox='-10 -10 20 20' width='20' height='20'>
      <path d='M-5 -6 L5 -6 L3 4 L-3 4 Z' ${stroke} />
      <line x1='0' y1='4' x2='0' y2='9' ${stroke} />
      <line x1='-3' y1='9' x2='3' y2='9' ${stroke} /></svg>`;
  }
  return `<svg viewBox='-12 -14 24 28' width='20' height='20'>
    <path d='M0 -10 L7 0 L4 0 L8 5 L4 5 L7 9 L-7 9 L-4 5 L-8 5 L-4 0 L-7 0 Z' ${stroke} />
    <line x1='0' y1='9' x2='0' y2='13' ${stroke} /></svg>`;
}
