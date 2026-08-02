import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const updated = db.updateLead(params.id, { tsaId: body.tsaId, updatedAt: new Date().toISOString() });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
