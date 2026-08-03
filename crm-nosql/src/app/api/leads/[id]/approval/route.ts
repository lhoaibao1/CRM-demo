import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const lead = db.lead(params.id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = db.updateLead(params.id, {
    approval: body.approval,
    updatedAt: new Date().toISOString(),
  });
  return NextResponse.json(updated);
}
