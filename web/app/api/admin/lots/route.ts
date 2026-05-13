import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { setLotStatus, updateLeadStatus } from "@/lib/store";
import type { LotStatus } from "@/lib/lots";

const VALID: LotStatus[] = ["available", "reserved", "sold"];

export async function POST(req: Request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { lotId, status, leadId, leadStatus } = await req.json();

  if (lotId && status) {
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    await setLotStatus(String(lotId), status as LotStatus);
  }

  if (leadId && leadStatus) {
    await updateLeadStatus(String(leadId), leadStatus);
  }

  return NextResponse.json({ ok: true });
}
