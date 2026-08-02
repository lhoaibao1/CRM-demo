import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
export async function GET(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(db.filterLeads(user));
}
export async function POST(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || (user.role !== "CTV" && user.role !== "Admin"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const num = String(db.leads().length + 1).padStart(3, "0");
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const now = new Date().toISOString();
  const lead = {
    id: `LD-${today}-${num}`, ...body,
    soTienYeuCau: Number(body.soTienYeuCau) || 0,
    ghiChuCTV: body.ghiChuCTV || "",
    ctvId: user.id, tsaId: null, statusId: 1,
    createdAt: now, updatedAt: now,
    history: [{ statusId: 1, note: "Import lead", by: user.hoTen, at: now }],
    approval: null,
  };
  db.addLead(lead);
  return NextResponse.json(lead, { status: 201 });
}
