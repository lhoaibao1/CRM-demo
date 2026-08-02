import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
export async function GET() {
  return NextResponse.json(db.users().map(({ password, ...u }) => u));
}
export async function POST(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  const admin = uid ? db.user(uid) : null;
  if (!admin || admin.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const id = "u" + (db.users().length + 1);
  const user = { id, username: body.username, password: body.password || "123456",
    hoTen: body.hoTen, role: body.role, sdt: body.sdt || "", cccd: body.cccd || "", active: true };
  db.addUser(user);
  const { password, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}
