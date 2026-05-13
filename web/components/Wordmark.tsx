"use client";

import { motion } from "motion/react";

/**
 * AcquaVille wordmark — recreated as inline SVG with the same
 * tone (navy "Acqua", lime "Ville") so we can animate it on landing.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span className="eyebrow text-[var(--av-ink-300)]">Condomínio</span>
      <span className="display text-[2.2rem] leading-none">
        <span className="text-[var(--av-cream-50)]">Acqua</span>
        <em className="not-italic font-light italic text-[var(--av-lime-400)]">
          Ville
        </em>
      </span>
      <span className="eyebrow text-[var(--av-ink-300)]">Residencial</span>
    </div>
  );
}

export function WordmarkLarge() {
  return (
    <div className="flex flex-col items-start gap-4">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="eyebrow text-[var(--av-lime-400)]"
      >
        Condomínio
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        className="display text-[clamp(3.6rem,9vw,9.5rem)] leading-[0.92] tracking-[-0.04em]"
      >
        <span className="text-[var(--av-cream-50)]">Acqua</span>
        <em className="font-light italic text-[var(--av-lime-400)]">Ville</em>
      </motion.h1>
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="display italic text-[var(--av-sand-300)] text-[clamp(1.6rem,2.6vw,2.4rem)] tracking-tight"
      >
        Residencial
      </motion.span>
    </div>
  );
}
