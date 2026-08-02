import { NextRequest, NextResponse } from "next/server";
import { addLead, filterLeadsForUser, getLead, getLeads, getUser } from "@/lib/store";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = getUser(userId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(filterLeadsForUser(user));
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const user = userId ? getUser(userId) : null;
  if (!user || (user.role !== "CTV" && user.role !== "Admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const num = String(getLeads().length + 1).padStart(3, "0");
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const now = new Date().toISOString();
  const lead = {
    id: `LD-${today}-${num}`,
    hoTen: body.hoTen,
    cccd: body.cccd,
    sdt: body.sdt,
    ngaySinh: body.ngaySinh,
    noiCap: body.noiCap,
    ngayCap: body.ngayCap,
    gioiTinh: body.gioiTinh,
    tinhThanh: body.tinhThanh,
    soTienYeuCau: Number(body.soTienYeuCau) || 0,
    ghiChuCTV: body.ghiChuCTV || "",
    ctvId: user.id,
    tsaId: null as string | null,
    statusId: 1,
    createdAt: now,
    updatedAt: now,
    history: [{ statusId: 1, note: "Import lead", by: user.hoTen, at: now }],
    approval: null,
  };
  addLead(lead);
  return NextResponse.json(lead, { status: 201 });
}
