/**
 * Auto-discover photos for each Point of Interest.
 * Looks in web/public/areas/<poiId>/*.{jpg,jpeg,png,webp}
 * Returns URL paths the browser can fetch.
 *
 * Server-only: import this from server components, not client components.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const AREAS_ROOT = path.join(process.cwd(), "public", "areas");
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export type AreaPhotos = Record<string, string[]>;

/** Returns photo URLs for one POI, sorted by filename. */
export async function listAreaPhotos(poiId: string): Promise<string[]> {
  const dir = path.join(AREAS_ROOT, poiId);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && EXTS.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort()
      .map((name) => `/areas/${poiId}/${name}`);
  } catch {
    return [];
  }
}

/** Bulk lookup for many POIs. */
export async function listAllAreaPhotos(poiIds: string[]): Promise<AreaPhotos> {
  const entries = await Promise.all(
    poiIds.map(async (id) => [id, await listAreaPhotos(id)] as const),
  );
  return Object.fromEntries(entries);
}
