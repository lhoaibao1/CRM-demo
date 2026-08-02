import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { role } = await req.json();
  const user = getUsers().find((u) => u.role === role);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
