import { NextRequest, NextResponse } from "next/server";
import { getUser, updateLead } from "@/lib/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = req.headers.get("x-user-id");
  const user = userId ? getUser(userId) : null;
  if (!user || user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const updated = updateLead(params.id, { tsaId: body.tsaId, updatedAt: new Date().toISOString() });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
