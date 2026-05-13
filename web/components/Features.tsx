"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const FEATURES = [
  {
    n: "01",
    title: "Segurança que se sente.",
    body:
      "Portaria 24h com controle de acesso, ronda motorizada e perimetria iluminada. Cada lote é dormida tranquila.",
  },
  {
    n: "02",
    title: "Infraestrutura subterrânea.",
    body:
      "Toda a rede elétrica e dados passa por dutos enterrados. Sem postes, sem fios — uma vista limpa para o céu de Santana.",
  },
  {
    n: "03",
    title: "Lazer integrado ao bairro.",
    body:
      "Praça central com rotunda paisagística, ciclovia interna, espaço pet e área de contemplação às margens do rio.",
  },
  {
    n: "04",
    title: "Acesso direto pela BA-172.",
    body:
      "A 4 minutos do centro de Santana e a 12 minutos do Aeroporto de Barreiras. Conectado, mas resguardado.",
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0.05, 0.85], ["0%", "100%"]);

  return (
    <section
      id="vantagens"
      ref={ref}
      className="relative bg-[var(--av-cream-50)] text-[var(--av-navy-950)] py-32 md:py-40"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-12">
          <div className="md:sticky md:top-24 self-start">
            <span className="eyebrow text-[var(--av-navy-700)]">
              01 — Vantagens
            </span>
            <h2 className="display mt-4 text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.95] tracking-tight max-w-[14ch]">
              Pensado <em>do</em> chão para cima.
            </h2>
            <p className="mt-6 text-[var(--av-ink-700)] text-lg max-w-prose">
              Cada decisão de projeto começou com uma pergunta: como o morador
              vive aqui em dez anos? A resposta está no que você não vê.
            </p>
          </div>

          <ol className="relative pl-10 md:pl-16 space-y-20">
            {/* Vertical progress line */}
            <span
              aria-hidden
              className="absolute left-1 top-0 bottom-0 w-px bg-[var(--av-cream-200)]"
            />
            <motion.span
              aria-hidden
              style={{ height: lineHeight }}
              className="absolute left-1 top-0 w-px bg-[var(--av-navy-950)] origin-top"
            />

            {FEATURES.map((f, i) => (
              <motion.li
                key={f.n}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.85, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <span
                  aria-hidden
                  className="absolute -left-12 md:-left-[4.4rem] top-2 h-2.5 w-2.5 rounded-full bg-[var(--av-lime-500)] ring-4 ring-[var(--av-cream-50)]"
                />
                <div className="eyebrow text-[var(--av-navy-700)]">{f.n}</div>
                <h3 className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] leading-tight tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-3 text-[var(--av-ink-700)] text-lg leading-relaxed max-w-prose">
                  {f.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
