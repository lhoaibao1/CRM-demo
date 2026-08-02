import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const lead = db.lead(params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = db.updateLead(params.id, { tsaId: body.tsaId, updatedAt: new Date().toISOString() });
  const tsa = db.user(body.tsaId);
  if (tsa) {
    db.notify(tsa.id, "Hồ sơ được gán cho bạn", `${lead.hoTen} (${lead.id}) – vui lòng xử lý`, lead.id);
  }
  if (lead.ctvId) {
    db.notify(lead.ctvId, "Hồ sơ đã gán TSA", `${lead.hoTen} được gán cho ${tsa?.hoTen || "TSA"}`, lead.id);
  }
  return NextResponse.json(updated);
}
