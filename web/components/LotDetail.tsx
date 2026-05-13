"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { brl, type Lot } from "@/lib/lots";

type Step = "specs" | "simulator" | "lead" | "done";

export function LotDetail({ lot, onClose }: { lot: Lot; onClose: () => void }) {
  const [step, setStep] = useState<Step>("specs");
  const [down, setDown] = useState(Math.round(lot.price * 0.3 / 1000) * 1000);
  const [term, setTerm] = useState(120);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthly = useMemo(() => {
    const principal = Math.max(0, lot.price - down);
    // simple monthly with 0.79% (typical loteamento financing)
    const i = 0.0079;
    if (term <= 0 || principal <= 0) return 0;
    const m = (principal * i) / (1 - Math.pow(1 + i, -term));
    return Math.round(m);
  }, [lot.price, down, term]);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          lotId: lot.id,
          quadra: lot.quadra,
          area: lot.area,
          price: lot.price,
          downPayment: down,
          termMonths: term,
          monthlyPayment: monthly,
          source: "site-plan",
        }),
      });
      if (!res.ok) throw new Error("Falha ao enviar.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center"
      data-lenis-prevent
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[var(--av-navy-950)]/85 backdrop-blur-lg"
      />

      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full md:max-w-[920px] md:mx-6 max-h-[92vh] overflow-y-auto bg-[var(--av-cream-50)] text-[var(--av-navy-950)] rounded-t-3xl md:rounded-3xl shadow-2xl"
        data-lenis-prevent
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 z-10 h-10 w-10 rounded-full bg-[var(--av-navy-950)] text-[var(--av-cream-50)] hover:bg-[var(--av-lime-400)] hover:text-[var(--av-navy-950)] transition-colors grid place-items-center"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <div className="grid md:grid-cols-[1.05fr_1fr]">
          {/* Left: lot specs / mini plan */}
          <div className="relative bg-[var(--av-navy-950)] text-[var(--av-cream-50)] p-8 md:p-12 overflow-hidden">
            <div
              aria-hidden
              className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full blob"
              style={{
                background:
                  "radial-gradient(circle, var(--av-lime-500) 0%, transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="eyebrow text-[var(--av-lime-400)]">
                {lot.quadra} · Lote {String(lot.number).padStart(2, "0")}
              </div>
              <h3 className="display mt-6 text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.95] tracking-tight">
                Um lote de <em>{lot.area} m²</em> esperando sua história.
              </h3>

              <dl className="mt-10 grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <Spec label="Área total" value={`${lot.area} m²`} />
                <Spec label="Frente" value={`${lot.frente} m`} />
                <Spec label="Fundo" value={`${lot.fundo} m`} />
                <Spec label="Quadra" value={lot.quadra} />
                <Spec
                  label="Valor à vista"
                  value={brl.format(lot.price)}
                  big
                />
                <Spec label="Status" value={lot.status === "available" ? "Disponível" : "Reservado"} />
              </dl>

              <div className="mt-12 p-5 rounded-2xl bg-[var(--av-navy-900)] border border-[var(--av-navy-800)]">
                <div className="eyebrow text-[var(--av-ink-300)]">Vantagens</div>
                <ul className="mt-3 space-y-2 text-sm text-[var(--av-cream-100)]">
                  <li className="flex gap-2"><Dot /> Loteamento fechado com portaria 24h</li>
                  <li className="flex gap-2"><Dot /> Áreas de lazer e contemplação</li>
                  <li className="flex gap-2"><Dot /> Infraestrutura completa (água, energia, asfalto)</li>
                  <li className="flex gap-2"><Dot /> Acesso direto pela BA-172</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: step content */}
          <div className="p-8 md:p-12">
            <Steps step={step} />

            {step === "specs" && (
              <div className="space-y-6">
                <h4 className="display text-3xl leading-tight tracking-tight">
                  Quanto cabe no seu plano?
                </h4>
                <p className="text-sm text-[var(--av-ink-700)]">
                  Use o simulador para ajustar entrada e prazo. A parcela é
                  recalculada em tempo real.
                </p>
                <button
                  onClick={() => setStep("simulator")}
                  className="w-full py-4 rounded-full bg-[var(--av-navy-950)] text-[var(--av-cream-50)] uppercase tracking-[0.18em] text-xs hover:bg-[var(--av-lime-500)] hover:text-[var(--av-navy-950)] transition-colors"
                >
                  Simular compra →
                </button>
              </div>
            )}

            {step === "simulator" && (
              <div className="space-y-7">
                <Slider
                  label="Entrada"
                  value={down}
                  min={Math.round(lot.price * 0.1 / 1000) * 1000}
                  max={lot.price}
                  step={1000}
                  format={(v) => brl.format(v)}
                  onChange={setDown}
                />
                <Slider
                  label="Prazo"
                  value={term}
                  min={24}
                  max={180}
                  step={12}
                  format={(v) => `${v} meses`}
                  onChange={setTerm}
                />

                <div className="p-5 rounded-2xl bg-[var(--av-navy-950)] text-[var(--av-cream-50)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--av-ink-300)]">
                    Parcela estimada
                  </div>
                  <div className="display text-4xl mt-2">
                    {brl.format(monthly)}
                    <span className="text-sm font-sans text-[var(--av-ink-300)] ml-2">
                      /mês
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-[var(--av-ink-300)]">
                    Valor estimado. Condições reais sujeitas a análise.
                  </div>
                </div>

                <button
                  onClick={() => setStep("lead")}
                  className="w-full py-4 rounded-full bg-[var(--av-lime-500)] text-[var(--av-navy-950)] uppercase tracking-[0.18em] text-xs hover:bg-[var(--av-lime-400)] transition-colors font-semibold"
                >
                  Quero reservar este lote →
                </button>
              </div>
            )}

            {step === "lead" && (
              <form onSubmit={submitLead} className="space-y-4">
                <h4 className="display text-3xl leading-tight">
                  Como falamos com você?
                </h4>
                <p className="text-sm text-[var(--av-ink-700)]">
                  Nossa equipe entra em contato em até 24h úteis para
                  confirmar a reserva.
                </p>
                <Input label="Nome completo" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input label="E-mail" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Input label="WhatsApp" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Input label="Observações (opcional)" textarea value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-[var(--av-navy-950)] text-[var(--av-cream-50)] uppercase tracking-[0.18em] text-xs hover:bg-[var(--av-lime-500)] hover:text-[var(--av-navy-950)] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Enviar reserva →"}
                </button>
              </form>
            )}

            {step === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="h-14 w-14 rounded-full bg-[var(--av-lime-500)] grid place-items-center">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M3 11.5 8 16.5 19 5.5" stroke="#0a1535" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="display text-3xl leading-tight">
                  Reserva recebida.
                </h4>
                <p className="text-sm text-[var(--av-ink-700)]">
                  Anotamos seu interesse pelo <strong>{lot.id}</strong>.
                  Em breve você recebe um contato da nossa equipe pelo
                  WhatsApp informado.
                </p>
                <button
                  onClick={onClose}
                  className="text-sm uppercase tracking-[0.18em] link-reveal text-[var(--av-navy-950)]"
                >
                  Voltar para a planta
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Spec({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-300)]">
        {label}
      </dt>
      <dd className={big ? "mt-2 display text-3xl text-[var(--av-lime-400)]" : "mt-1 font-medium text-[var(--av-cream-50)]"}>
        {value}
      </dd>
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const steps = ["specs", "simulator", "lead", "done"];
  return (
    <ol className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => {
        const reached = steps.indexOf(step) >= i;
        return (
          <li key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className={`h-1.5 flex-1 rounded-full ${
                reached ? "bg-[var(--av-navy-950)]" : "bg-[var(--av-cream-200)]"
              }`}
            />
          </li>
        );
      })}
    </ol>
  );
}

function Slider({
  label, value, min, max, step, format, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-700)]">
          {label}
        </span>
        <span className="display text-lg">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--av-lime-500)]"
      />
      <div className="flex justify-between mt-1 text-[10px] text-[var(--av-ink-500)]">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </label>
  );
}

function Input({
  label, value, onChange, type = "text", required, textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-700)]">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          required={required}
          className="mt-1 w-full bg-transparent border-b border-[var(--av-navy-950)]/30 py-2 focus:outline-none focus:border-[var(--av-lime-500)] text-base"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="mt-1 w-full bg-transparent border-b border-[var(--av-navy-950)]/30 py-2 focus:outline-none focus:border-[var(--av-lime-500)] text-base"
        />
      )}
    </label>
  );
}

function Dot() {
  return (
    <span className="inline-block mt-2 h-1 w-1 rounded-full bg-[var(--av-lime-400)] flex-none" />
  );
}

