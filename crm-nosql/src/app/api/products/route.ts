import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  return NextResponse.json(db.products().filter((p) => p.active !== false));
}

export async function POST(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.name || body.laiSuat == null) return NextResponse.json({ error: "Thiếu tên/lãi suất" }, { status: 400 });
  const p = { id: "p" + Date.now(), name: body.name, laiSuat: Number(body.laiSuat), active: true };
  db.addProduct(p);
  return NextResponse.json(db.products(), { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  db.removeProduct(id);
  return NextResponse.json(db.products());
}
