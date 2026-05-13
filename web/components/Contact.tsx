"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lotId: "GERAL",
          quadra: "—",
          area: 0,
          price: 0,
          downPayment: 0,
          termMonths: 0,
          monthlyPayment: 0,
          source: "contact-form",
        }),
      });
      if (!res.ok) throw new Error();
      setState("ok");
      setForm({ name: "", email: "", phone: "", notes: "" });
    } catch {
      setState("err");
    }
  }

  return (
    <section
      id="contato"
      className="relative bg-[var(--av-cream-50)] text-[var(--av-navy-950)] py-32 md:py-40"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow text-[var(--av-navy-700)]">04 — Contato</span>
          <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-tight">
            Vamos conversar <em>com calma</em>.
          </h2>
          <p className="mt-6 text-[var(--av-ink-700)] text-lg leading-relaxed max-w-prose">
            Nossa equipe está pronta para te apresentar o AcquaVille em uma
            visita guiada, presencial ou por vídeo. Sem pressão — só
            esclarecimento.
          </p>

          <div className="mt-12 space-y-6">
            <ContactRow label="WhatsApp" value="(77) 9 9999-0000" />
            <ContactRow label="E-mail" value="reservas@acquaville.com.br" />
            <ContactRow label="Endereço" value="BA-172, km 4 · Santana, Bahia" />
            <ContactRow label="Horário" value="Seg–Sáb, 8h às 18h" />
          </div>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[var(--av-navy-950)] text-[var(--av-cream-50)] rounded-3xl p-8 md:p-12"
        >
          <h3 className="display text-2xl mb-8">Receba o catálogo completo</h3>

          <div className="space-y-6">
            <Field label="Nome">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full bg-transparent border-b border-[var(--av-cream-50)]/30 py-2 focus:outline-none focus:border-[var(--av-lime-500)] text-base"
              />
            </Field>
            <Field label="E-mail">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full bg-transparent border-b border-[var(--av-cream-50)]/30 py-2 focus:outline-none focus:border-[var(--av-lime-500)] text-base"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full bg-transparent border-b border-[var(--av-cream-50)]/30 py-2 focus:outline-none focus:border-[var(--av-lime-500)] text-base"
              />
            </Field>
            <Field label="Mensagem (opcional)">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="mt-1 w-full bg-transparent border-b border-[var(--av-cream-50)]/30 py-2 focus:outline-none focus:border-[var(--av-lime-500)] text-base resize-none"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={state === "sending"}
            className="mt-10 w-full py-4 rounded-full bg-[var(--av-lime-500)] text-[var(--av-navy-950)] uppercase tracking-[0.18em] text-xs font-semibold hover:bg-[var(--av-lime-400)] transition-colors disabled:opacity-50"
          >
            {state === "sending" ? "Enviando..." : "Quero receber"}
          </button>

          {state === "ok" && (
            <p className="mt-4 text-sm text-[var(--av-lime-400)]">
              Recebemos seu contato. Em breve você terá notícias da equipe.
            </p>
          )}
          {state === "err" && (
            <p className="mt-4 text-sm text-red-300">
              Não conseguimos enviar agora. Tente novamente em instantes.
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-300)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-6 border-b border-[var(--av-cream-200)] pb-4">
      <span className="eyebrow text-[var(--av-navy-700)] w-24">{label}</span>
      <span className="display text-xl md:text-2xl tracking-tight">{value}</span>
    </div>
  );
}
