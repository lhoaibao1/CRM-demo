import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = db.byLogin(username, password);
  if (!user) return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
  const { password: _, ...safe } = user;
  return NextResponse.json(safe);
}
