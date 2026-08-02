import { NextRequest, NextResponse } from "next/server";
import { db, STATUSES } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || (user.role !== "Admin" && user.role !== "TSA"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const lead = db.lead(params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "TSA" && lead.tsaId !== user.id)
    return NextResponse.json({ error: "Not assigned" }, { status: 403 });
  const body = await req.json();
  const now = new Date().toISOString();
  const statusId = Number(body.statusId);
  const history = [...lead.history, { statusId, note: body.note || "", by: user.hoTen, at: now }];
  const updated = db.updateLead(params.id, {
    statusId, updatedAt: now, history,
    approval: body.approval ?? lead.approval,
  });
  const stName = STATUSES.find((s) => s.id === statusId)?.name || String(statusId);
  // Notify CTV
  if (lead.ctvId) {
    db.notify(lead.ctvId, "Hồ sơ chuyển bước", `${lead.hoTen} (${lead.id}) → ${stName}`, lead.id);
  }
  // Notify TSA if assigned and not the actor
  if (lead.tsaId && lead.tsaId !== user.id) {
    db.notify(lead.tsaId, "Hồ sơ chuyển bước", `${lead.hoTen} (${lead.id}) → ${stName}`, lead.id);
  }
  // Notify all admins except actor
  db.users().filter((u) => u.role === "Admin" && u.id !== user.id).forEach((a) => {
    db.notify(a.id, "Hồ sơ chuyển bước", `${lead.hoTen} (${lead.id}) → ${stName}`, lead.id);
  });
  return NextResponse.json(updated);
}
