import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const lead = db.lead(params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lead = db.lead(params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  // Admin: full edit. TSA assigned: only idRlos
  if (user.role === "Admin") {
    const allowed = [
      "hoTen","cccd","sdt","ngaySinh","noiCap","ngayCap","gioiTinh","tinhThanh",
      "soTienYeuCau","ghiChuCTV","idRlos","tsaId",
    ];
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    for (const k of allowed) {
      if (body[k] !== undefined) patch[k] = k === "soTienYeuCau" ? Number(body[k]) : body[k];
    }
    return NextResponse.json(db.updateLead(params.id, patch as any));
  }
  if (user.role === "TSA" && lead.tsaId === user.id && body.idRlos !== undefined) {
    return NextResponse.json(db.updateLead(params.id, { idRlos: body.idRlos, updatedAt: new Date().toISOString() }));
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
