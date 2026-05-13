"use client";

import { motion } from "motion/react";

export function Location() {
  return (
    <section
      id="local"
      className="relative bg-[var(--av-navy-950)] text-[var(--av-cream-50)] py-32 md:py-40 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 -left-1/4 w-[60vw] h-[60vw] rounded-full blob"
        style={{ background: "radial-gradient(circle, var(--av-navy-700) 0%, transparent 60%)" }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">
        <div>
          <span className="eyebrow">03 — Localização</span>
          <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-tight">
            No <em>coração</em> do Oeste baiano.
          </h2>
          <p className="mt-6 text-[var(--av-ink-300)] text-lg max-w-prose leading-relaxed">
            Santana é a porta de entrada do Oeste — agrícola, próspera e em
            franca expansão. O AcquaVille fica a poucos minutos do centro
            urbano, mas com a paz que só o campo entrega.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-y-8 gap-x-6">
            <Stat label="Centro de Santana" value="4 min" />
            <Stat label="Aeroporto de Barreiras" value="12 min" />
            <Stat label="Rio Corrente" value="800 m" />
            <Stat label="Hospital Regional" value="6 min" />
          </dl>
        </div>

        {/* Stylized minimap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-200px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[5/4] rounded-3xl border border-[var(--av-navy-800)] bg-gradient-to-br from-[var(--av-navy-900)] to-[var(--av-navy-950)] p-6 md:p-10"
        >
          <svg viewBox="0 0 500 400" className="w-full h-full">
            {/* River */}
            <path
              d="M 20 320 Q 120 280 180 300 T 320 280 T 480 220"
              stroke="#4866d6"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            />
            <text x="380" y="210" fill="#4866d6" fontSize="10" letterSpacing="4">
              RIO CORRENTE
            </text>

            {/* BA-172 road */}
            <path
              d="M 0 100 Q 120 130 250 180 T 500 280"
              stroke="#a5e635"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 6"
            />
            <text x="40" y="90" fill="#a5e635" fontSize="10" letterSpacing="4">
              BA-172
            </text>

            {/* Santana city marker */}
            <circle cx="100" cy="60" r="6" fill="#faf7f0" />
            <text x="115" y="65" fill="#faf7f0" fontSize="12" fontFamily="var(--font-fraunces)">
              Santana, BA
            </text>

            {/* AcquaVille marker */}
            <motion.g
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle cx="280" cy="200" r="32" fill="#a5e635" opacity="0.2">
                <animate attributeName="r" values="32;42;32" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="280" cy="200" r="16" fill="#a5e635" />
              <circle cx="280" cy="200" r="6" fill="#0a1535" />
              <text x="280" y="245" textAnchor="middle" fill="#a5e635" fontSize="11" letterSpacing="3" fontFamily="var(--font-jakarta)">
                ACQUAVILLE
              </text>
            </motion.g>

            {/* Compass */}
            <g transform="translate(440 340)">
              <circle cx="0" cy="0" r="22" fill="none" stroke="#5b637c" strokeWidth="0.8" />
              <path d="M 0 -18 L 4 0 L 0 18 L -4 0 Z" fill="#faf7f0" />
              <text x="0" y="-26" textAnchor="middle" fill="#faf7f0" fontSize="9">N</text>
            </g>

            {/* Distance ticks */}
            <line x1="100" y1="60" x2="280" y2="200" stroke="#5b637c" strokeWidth="0.5" strokeDasharray="2 4" />
            <text x="170" y="135" fill="#a5acbf" fontSize="9" transform="rotate(40 170 135)">
              4 min · 3,1 km
            </text>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-[var(--av-ink-300)]">
        {label}
      </dt>
      <dd className="display text-3xl md:text-4xl mt-1 text-[var(--av-lime-400)]">
        {value}
      </dd>
    </div>
  );
}
