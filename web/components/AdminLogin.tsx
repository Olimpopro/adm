"use client";

import { useState } from "react";

export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      setErr(data.error ?? "Falha no login");
    }
    setSending(false);
  }

  return (
    <main className="min-h-[100svh] grid place-items-center bg-[var(--av-navy-950)] px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-[var(--av-navy-900)] border border-[var(--av-navy-800)] rounded-3xl p-10"
      >
        <div className="display text-3xl">
          Acqua<em className="italic text-[var(--av-lime-400)]">Ville</em>
        </div>
        <div className="eyebrow mt-2 text-[var(--av-ink-300)]">
          Painel Administrativo
        </div>

        <label className="block mt-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-300)]">
            Senha
          </span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            className="mt-2 w-full bg-transparent border-b border-[var(--av-cream-50)]/30 py-3 focus:outline-none focus:border-[var(--av-lime-500)] text-lg"
          />
        </label>

        {err && (
          <div className="mt-4 text-sm text-red-300">{err}</div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="mt-8 w-full py-3.5 rounded-full bg-[var(--av-lime-500)] text-[var(--av-navy-950)] uppercase tracking-[0.18em] text-xs font-semibold hover:bg-[var(--av-lime-400)] transition-colors disabled:opacity-50"
        >
          {sending ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-6 text-xs text-[var(--av-ink-500)]">
          Senha padrão de desenvolvimento: <code className="text-[var(--av-lime-400)]">acqua2025</code>.
          Defina <code>ADMIN_PASSWORD</code> no <code>.env</code> antes do deploy.
        </p>
      </form>
    </main>
  );
}
