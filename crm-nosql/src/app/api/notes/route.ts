import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  return NextResponse.json(db.notes());
}

export async function POST(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.code || !body.content) return NextResponse.json({ error: "Thiếu mã/nội dung" }, { status: 400 });
  if (db.notes().some((n) => n.code === body.code)) return NextResponse.json({ error: "Mã đã tồn tại" }, { status: 400 });
  db.addNote({ code: body.code.toUpperCase(), content: body.content });
  return NextResponse.json(db.notes(), { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const user = uid ? db.user(uid) : null;
  if (!user || user.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Thiếu code" }, { status: 400 });
  db.removeNote(code);
  return NextResponse.json(db.notes());
}
