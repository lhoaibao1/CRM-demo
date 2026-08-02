import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    items: db.notifications(uid).slice(0, 30),
    unread: db.unreadCount(uid),
  });
}

export async function PATCH(req: NextRequest) {
  const uid = req.headers.get("x-user-id");
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  db.markRead(uid, body.id);
  return NextResponse.json({ ok: true, unread: db.unreadCount(uid) });
}
