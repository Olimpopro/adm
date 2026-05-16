"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { POI } from "@/lib/lots";

type Props = {
  poi: POI;
  photos: string[];
  onClose: () => void;
};

export function AreaDetail({ poi, photos, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const hasPhotos = photos.length > 0;

  const next = useCallback(() => {
    if (!hasPhotos) return;
    setIndex((i) => (i + 1) % photos.length);
  }, [hasPhotos, photos.length]);

  const prev = useCallback(() => {
    if (!hasPhotos) return;
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [hasPhotos, photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      data-lenis-prevent
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--av-navy-950)]/92 backdrop-blur-2xl"
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[1320px] mx-4 md:mx-8 max-h-[92vh] overflow-hidden rounded-3xl bg-[var(--av-navy-950)] text-[var(--av-cream-50)] shadow-[0_50px_120px_-20px_rgba(0,0,0,0.8)] grid md:grid-cols-[1.6fr_1fr]"
        data-lenis-prevent
      >
        {/* Photo viewer */}
        <div className="relative bg-black aspect-[4/3] md:aspect-auto md:min-h-[560px] overflow-hidden">
          {hasPhotos ? (
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={photos[index]}
                  alt={`${poi.label} — foto ${index + 1}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
                {/* cinematic vignette */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(5,10,31,0.55) 0%, rgba(5,10,31,0.05) 35%, transparent 60%)",
                  }}
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <PhotoPlaceholder poi={poi} />
          )}

          {/* nav arrows */}
          {hasPhotos && photos.length > 1 && (
            <>
              <NavBtn dir="prev" onClick={prev} />
              <NavBtn dir="next" onClick={next} />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-8 bg-[var(--av-lime-400)]" : "w-1.5 bg-white/50"
                    }`}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Side panel */}
        <div className="relative p-8 md:p-12 overflow-y-auto">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-5 right-5 h-10 w-10 rounded-full bg-[var(--av-navy-900)] hover:bg-[var(--av-lime-400)] hover:text-[var(--av-navy-950)] transition-colors grid place-items-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          <div className="eyebrow text-[var(--av-lime-400)]">Estilo de vida</div>
          <h3 className="display mt-5 text-[clamp(2rem,3.5vw,3rem)] leading-[0.95] tracking-tight">
            {poi.label}
          </h3>
          <p className="mt-5 text-[var(--av-ink-300)] text-base leading-relaxed">
            {poi.description}
          </p>

          {hasPhotos ? (
            <div className="mt-8 text-xs uppercase tracking-[0.2em] text-[var(--av-ink-300)]">
              {index + 1} <span className="opacity-40 mx-2">/</span> {photos.length}
              {photos.length > 1 && (
                <span className="ml-3 opacity-60">← → para navegar</span>
              )}
            </div>
          ) : (
            <div className="mt-8 p-5 rounded-2xl border border-[var(--av-navy-800)] bg-[var(--av-navy-900)]">
              <div className="eyebrow text-[var(--av-ink-300)]">Fotos em breve</div>
              <p className="mt-2 text-sm text-[var(--av-cream-100)]">
                Adicione imagens em{" "}
                <code className="text-[var(--av-lime-400)]">
                  public/areas/{poi.id}/
                </code>{" "}
                e elas aparecem aqui automaticamente.
              </p>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-[var(--av-navy-800)]">
            <a
              href="#planta"
              onClick={onClose}
              className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.18em] link-reveal text-[var(--av-lime-400)]"
            >
              Explorar lotes próximos →
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NavBtn({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "prev" ? "Foto anterior" : "Próxima foto"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        dir === "prev" ? "left-4" : "right-4"
      } h-12 w-12 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-[var(--av-cream-50)] grid place-items-center transition-colors`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        {dir === "prev" ? (
          <path d="M12 2 5 9l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 2l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function PhotoPlaceholder({ poi }: { poi: POI }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, rgba(74,86,135,0.6) 0%, transparent 55%)," +
          "radial-gradient(circle at 80% 80%, rgba(165,230,53,0.25) 0%, transparent 50%)," +
          "linear-gradient(to bottom, #0a1535 0%, #050a1f 100%)",
      }}
    >
      <div className="text-center px-8">
        <div className="display text-[clamp(2.5rem,5vw,5rem)] text-[var(--av-cream-50)]/80 leading-none">
          {poi.label}
        </div>
        <div className="eyebrow mt-6 text-[var(--av-lime-400)]">
          Galeria em produção
        </div>
      </div>
      {/* subtle grain */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-30 grain"
      />
    </div>
  );
}
