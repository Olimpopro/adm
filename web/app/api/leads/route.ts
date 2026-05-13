import { NextResponse } from "next/server";
import { addLead } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const required = ["name", "email", "phone", "lotId"];
    for (const k of required) {
      if (typeof body[k] !== "string" || body[k].trim() === "") {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${k}` },
          { status: 400 },
        );
      }
    }

    const lead = await addLead({
      name: String(body.name).trim().slice(0, 120),
      email: String(body.email).trim().slice(0, 200),
      phone: String(body.phone).trim().slice(0, 40),
      lotId: String(body.lotId).slice(0, 30),
      quadra: String(body.quadra ?? "").slice(0, 12),
      area: Number(body.area) || 0,
      price: Number(body.price) || 0,
      downPayment: Number(body.downPayment) || 0,
      termMonths: Number(body.termMonths) || 0,
      monthlyPayment: Number(body.monthlyPayment) || 0,
      notes: body.notes ? String(body.notes).slice(0, 1000) : undefined,
      source: String(body.source ?? "unknown").slice(0, 40),
    });

    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    console.error("[leads] error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
