"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { WordmarkLarge } from "./Wordmark";

const REVEAL_WORDS = ["O", "primeiro", "condomínio", "fechado", "de", "Santana."];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const blurY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--av-navy-950)] grain"
    >
      {/* Atmospheric blobs (water/landscape feel) */}
      <motion.div
        aria-hidden
        style={{ y: blurY }}
        className="absolute -top-40 -left-20 w-[60vw] h-[60vw] rounded-full blob"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--av-navy-600) 0%, transparent 60%)",
          }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ y: blurY }}
        className="absolute top-1/4 -right-40 w-[55vw] h-[55vw] rounded-full blob"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--av-lime-500) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* Top nav */}
      <header className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12 pt-8 md:pt-10 flex items-center justify-between">
        <div className="display text-2xl">
          <span className="text-[var(--av-cream-50)]">Acqua</span>
          <em className="italic text-[var(--av-lime-400)]">Ville</em>
        </div>
        <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.22em] text-[var(--av-ink-300)]">
          <a href="#planta" className="link-reveal hover:text-[var(--av-cream-50)]">Planta</a>
          <a href="#vantagens" className="link-reveal hover:text-[var(--av-cream-50)]">Vantagens</a>
          <a href="#local" className="link-reveal hover:text-[var(--av-cream-50)]">Localização</a>
          <a href="#contato" className="link-reveal hover:text-[var(--av-cream-50)]">Contato</a>
        </nav>
        <a
          href="#planta"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--av-lime-500)] text-[var(--av-navy-950)] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[var(--av-lime-400)] transition-colors"
        >
          Reservar lote
        </a>
      </header>

      {/* Hero content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12 pt-16 md:pt-28"
      >
        <WordmarkLarge />

        <div className="mt-12 md:mt-20 grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-end">
          <motion.h2
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } },
            }}
            className="display text-[clamp(1.8rem,3.5vw,3.2rem)] leading-[1.05] max-w-[24ch] text-[var(--av-cream-50)]"
          >
            {REVEAL_WORDS.map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { y: "120%", opacity: 0 },
                  show: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="inline-block overflow-hidden mr-[0.3em]"
              >
                <span className="inline-block">
                  {word === "fechado" ? <em className="not-italic italic text-[var(--av-lime-400)]">{word}</em> : word}
                </span>
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <p className="text-[var(--av-ink-300)] text-lg leading-relaxed max-w-prose">
              Lotes a partir de 250 m², infraestrutura completa e portaria 24h
              às margens da <strong className="text-[var(--av-cream-50)] font-normal">BA-172</strong>.
              Reserve online em três passos e acompanhe a disponibilidade em
              tempo real.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#planta"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[var(--av-lime-500)] text-[var(--av-navy-950)] text-sm uppercase tracking-[0.18em] font-semibold hover:bg-[var(--av-lime-400)] transition-colors"
              >
                Ver planta interativa
                <Arrow />
              </a>
              <a
                href="#contato"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-[var(--av-ink-700)] text-[var(--av-cream-50)] text-sm uppercase tracking-[0.18em] hover:border-[var(--av-lime-400)] hover:text-[var(--av-lime-400)] transition-colors"
              >
                Falar com corretor
              </a>
            </div>
          </motion.div>
        </div>

        {/* Hero stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--av-navy-800)] rounded-2xl overflow-hidden border border-[var(--av-navy-800)]"
        >
          <Stat label="Lotes" value="128" sub="Distribuídos em 11 quadras" />
          <Stat label="Acesso" value="BA-172" sub="Rodovia principal" />
          <Stat label="Área média" value="312 m²" sub="Frente de 13 m" />
          <Stat label="Entrega" value="2026" sub="Infra. completa" />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-[var(--av-ink-300)] flex flex-col items-center gap-3"
      >
        <span>Role para explorar</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-[var(--av-lime-400)]"
        />
      </motion.div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[var(--av-navy-950)] p-6 md:p-8">
      <div className="eyebrow">{label}</div>
      <div className="display text-3xl md:text-5xl mt-2 leading-none">{value}</div>
      <div className="mt-2 text-xs text-[var(--av-ink-300)]">{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
