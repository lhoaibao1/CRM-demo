import { NextRequest, NextResponse } from "next/server";
import { getLead, getUser, updateLead } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get("x-user-id");
  const user = userId ? getUser(userId) : null;
  if (!user || (user.role !== "Admin" && user.role !== "TSA")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const lead = getLead(params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "TSA" && lead.tsaId !== user.id) {
    return NextResponse.json({ error: "Not assigned" }, { status: 403 });
  }
  const body = await req.json();
  const now = new Date().toISOString();
  const history = [...lead.history, { statusId: Number(body.statusId), note: body.note || "", by: user.hoTen, at: now }];
  const updated = updateLead(params.id, {
    statusId: Number(body.statusId),
    updatedAt: now,
    history,
    approval: body.approval ?? lead.approval,
  });
  return NextResponse.json(updated);
}
