/**
 * Tiny file-backed JSON store for the CRM.
 * Keeps two collections under data/:
 *   - leads.json  → captured simulator submissions
 *   - lots.json   → admin-managed lot status overrides
 *
 * Reads/writes are synchronous (Node fs) — fine for the prototype scale.
 * In production this gets swapped for Postgres + Prisma.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { initialLots, type Lot, type LotStatus } from "./lots";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const LOTS_FILE = path.join(DATA_DIR, "lots.json");

export type Lead = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  lotId: string;
  quadra: string;
  area: number;
  price: number;
  downPayment: number;
  termMonths: number;
  monthlyPayment: number;
  notes?: string;
  source: string;
  status: "new" | "contacted" | "negotiating" | "closed" | "lost";
};

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/* ───────────────────── Leads ───────────────────── */

export async function listLeads(): Promise<Lead[]> {
  return readJson<Lead[]>(LEADS_FILE, []);
}

export async function addLead(lead: Omit<Lead, "id" | "createdAt" | "status">): Promise<Lead> {
  const all = await listLeads();
  const created: Lead = {
    ...lead,
    id: `LD-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  all.unshift(created);
  await writeJson(LEADS_FILE, all);
  return created;
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<Lead | null> {
  const all = await listLeads();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status };
  await writeJson(LEADS_FILE, all);
  return all[idx];
}

/* ───────────────────── Lots ───────────────────── */

type LotOverrides = Record<string, LotStatus>;

export async function getLotOverrides(): Promise<LotOverrides> {
  return readJson<LotOverrides>(LOTS_FILE, {});
}

export async function setLotStatus(lotId: string, status: LotStatus): Promise<void> {
  const overrides = await getLotOverrides();
  overrides[lotId] = status;
  await writeJson(LOTS_FILE, overrides);
}

export async function loadLots(): Promise<Lot[]> {
  const overrides = await getLotOverrides();
  return initialLots.map((l) =>
    overrides[l.id] ? { ...l, status: overrides[l.id] } : l,
  );
}
