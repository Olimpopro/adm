"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { brl, type Lot, type LotStatus } from "@/lib/lots";
import type { Lead } from "@/lib/store";

const LOT_STATUS_OPTIONS: { value: LotStatus; label: string; cls: string }[] = [
  { value: "available", label: "Disponível", cls: "text-[var(--av-lime-400)]" },
  { value: "reserved", label: "Reservado", cls: "text-[#f5b73a]" },
  { value: "sold", label: "Vendido", cls: "text-[var(--av-ink-300)]" },
];

const LEAD_STATUS_OPTIONS: { value: Lead["status"]; label: string }[] = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "negotiating", label: "Negociando" },
  { value: "closed", label: "Fechado" },
  { value: "lost", label: "Perdido" },
];

export function AdminDashboard({
  leads,
  lots,
}: {
  leads: Lead[];
  lots: Lot[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"leads" | "lots">("leads");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LotStatus>("all");
  const [pending, startTransition] = useTransition();

  const filteredLots = useMemo(() => {
    return lots.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search && !l.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [lots, statusFilter, search]);

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    const s = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        l.lotId.toLowerCase().includes(s),
    );
  }, [leads, search]);

  const counts = useMemo(
    () => ({
      total: lots.length,
      available: lots.filter((l) => l.status === "available").length,
      reserved: lots.filter((l) => l.status === "reserved").length,
      sold: lots.filter((l) => l.status === "sold").length,
      leads: leads.length,
      newLeads: leads.filter((l) => l.status === "new").length,
    }),
    [lots, leads],
  );

  async function updateLot(lotId: string, status: LotStatus) {
    await fetch("/api/admin/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lotId, status }),
    });
    startTransition(() => router.refresh());
  }

  async function updateLead(leadId: string, leadStatus: Lead["status"]) {
    await fetch("/api/admin/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, leadStatus }),
    });
    startTransition(() => router.refresh());
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  }

  return (
    <main className="min-h-screen bg-[var(--av-navy-950)] text-[var(--av-cream-50)]">
      <header className="border-b border-[var(--av-navy-800)] bg-[var(--av-navy-900)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="display text-2xl">
              Acqua<em className="italic text-[var(--av-lime-400)]">Ville</em>
            </div>
            <span className="hidden md:inline eyebrow text-[var(--av-ink-300)]">
              Painel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs uppercase tracking-[0.18em] text-[var(--av-ink-300)] link-reveal">
              Ver site
            </a>
            <button
              onClick={logout}
              className="text-xs uppercase tracking-[0.18em] text-[var(--av-cream-50)] link-reveal"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPI label="Lotes" value={counts.total} />
          <KPI label="Disponíveis" value={counts.available} accent="lime" />
          <KPI label="Reservados" value={counts.reserved} accent="amber" />
          <KPI label="Vendidos" value={counts.sold} accent="muted" />
          <KPI label="Leads" value={counts.leads} sub={`${counts.newLeads} novos`} />
        </section>

        {/* Tabs */}
        <div className="mt-12 flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex bg-[var(--av-navy-900)] border border-[var(--av-navy-800)] rounded-full p-1">
            <TabBtn active={tab === "leads"} onClick={() => setTab("leads")}>
              Leads / CRM
            </TabBtn>
            <TabBtn active={tab === "lots"} onClick={() => setTab("lots")}>
              Gerenciar lotes
            </TabBtn>
          </div>

          <div className="flex gap-3 flex-wrap">
            {tab === "lots" && (
              <div className="inline-flex bg-[var(--av-navy-900)] border border-[var(--av-navy-800)] rounded-full p-1">
                {(["all", "available", "reserved", "sold"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setStatusFilter(k)}
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-colors ${
                      statusFilter === k
                        ? "bg-[var(--av-lime-500)] text-[var(--av-navy-950)]"
                        : "text-[var(--av-ink-300)]"
                    }`}
                  >
                    {k === "all" ? "Todos" : LOT_STATUS_OPTIONS.find((o) => o.value === k)?.label}
                  </button>
                ))}
              </div>
            )}
            <input
              type="search"
              placeholder={tab === "leads" ? "Buscar lead..." : "Buscar lote..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-full bg-[var(--av-navy-900)] border border-[var(--av-navy-800)] text-sm w-64 focus:outline-none focus:border-[var(--av-lime-400)]"
            />
          </div>
        </div>

        {/* Table */}
        <AnimatePresence mode="wait">
          {tab === "leads" ? (
            <motion.section
              key="leads"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <div className="overflow-x-auto rounded-2xl border border-[var(--av-navy-800)] bg-[var(--av-navy-900)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-300)] border-b border-[var(--av-navy-800)]">
                      <th className="px-4 py-4">Data</th>
                      <th className="px-4 py-4">Lead</th>
                      <th className="px-4 py-4">Contato</th>
                      <th className="px-4 py-4">Lote</th>
                      <th className="px-4 py-4">Simulação</th>
                      <th className="px-4 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center text-[var(--av-ink-300)]">
                          Nenhum lead ainda. Quando alguém preencher o
                          simulador, aparece aqui.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => (
                        <tr
                          key={l.id}
                          className="border-b border-[var(--av-navy-800)] last:border-b-0 hover:bg-[var(--av-navy-800)]/30"
                        >
                          <td className="px-4 py-4 text-xs text-[var(--av-ink-300)]">
                            {new Date(l.createdAt).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium">{l.name}</div>
                            <div className="text-xs text-[var(--av-ink-300)]">
                              via {l.source}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <div>{l.email}</div>
                            <div className="text-[var(--av-ink-300)]">{l.phone}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="display text-lg">{l.lotId}</div>
                            {l.area > 0 && (
                              <div className="text-xs text-[var(--av-ink-300)]">{l.area} m²</div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-xs">
                            {l.price > 0 ? (
                              <>
                                <div>{brl.format(l.price)}</div>
                                <div className="text-[var(--av-ink-300)]">
                                  {brl.format(l.downPayment)} + {l.termMonths}×{" "}
                                  {brl.format(l.monthlyPayment)}
                                </div>
                              </>
                            ) : (
                              <span className="text-[var(--av-ink-300)]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={l.status}
                              onChange={(e) => updateLead(l.id, e.target.value as Lead["status"])}
                              className="bg-[var(--av-navy-950)] border border-[var(--av-navy-800)] rounded-full text-xs px-3 py-1.5"
                            >
                              {LEAD_STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="lots"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <div className="overflow-x-auto rounded-2xl border border-[var(--av-navy-800)] bg-[var(--av-navy-900)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-[var(--av-ink-300)] border-b border-[var(--av-navy-800)]">
                      <th className="px-4 py-4">Lote</th>
                      <th className="px-4 py-4">Quadra</th>
                      <th className="px-4 py-4">Área</th>
                      <th className="px-4 py-4">Frente × Fundo</th>
                      <th className="px-4 py-4">Valor</th>
                      <th className="px-4 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLots.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-[var(--av-navy-800)] last:border-b-0 hover:bg-[var(--av-navy-800)]/30"
                      >
                        <td className="px-4 py-3">
                          <div className="display text-lg">{l.id}</div>
                        </td>
                        <td className="px-4 py-3 text-[var(--av-ink-300)]">{l.quadra}</td>
                        <td className="px-4 py-3">{l.area} m²</td>
                        <td className="px-4 py-3 text-xs">
                          {l.frente} × {l.fundo} m
                        </td>
                        <td className="px-4 py-3">{brl.format(l.price)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={l.status}
                            onChange={(e) => updateLot(l.id, e.target.value as LotStatus)}
                            className="bg-[var(--av-navy-950)] border border-[var(--av-navy-800)] rounded-full text-xs px-3 py-1.5"
                          >
                            {LOT_STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-[var(--av-ink-500)]">
                {filteredLots.length} lote(s) listado(s){pending && " · salvando…"}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function KPI({
  label, value, sub, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "lime" | "amber" | "muted";
}) {
  const color =
    accent === "lime"
      ? "text-[var(--av-lime-400)]"
      : accent === "amber"
        ? "text-[#f5b73a]"
        : accent === "muted"
          ? "text-[var(--av-ink-300)]"
          : "text-[var(--av-cream-50)]";
  return (
    <div className="bg-[var(--av-navy-900)] border border-[var(--av-navy-800)] rounded-2xl p-5">
      <div className="eyebrow text-[var(--av-ink-300)]">{label}</div>
      <div className={`display mt-1 text-4xl ${color}`}>{value}</div>
      {sub && <div className="text-xs text-[var(--av-ink-300)] mt-1">{sub}</div>}
    </div>
  );
}

function TabBtn({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.18em] transition-colors ${
        active
          ? "bg-[var(--av-lime-500)] text-[var(--av-navy-950)] font-semibold"
          : "text-[var(--av-ink-300)] hover:text-[var(--av-cream-50)]"
      }`}
    >
      {children}
    </button>
  );
}
