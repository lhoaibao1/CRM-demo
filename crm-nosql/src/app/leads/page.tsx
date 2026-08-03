"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders, useUser } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { STATUSES } from "@/lib/store";
import { Search, Plus, Eye, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

type Lead = {
  id: string; hoTen: string; sdt: string; cccd: string; ctvId: string; tsaId: string | null;
  statusId: number; createdAt: string; updatedAt?: string; soTienYeuCau: number; idRlos?: string;
  tinhThanh?: string; gioiTinh?: string; ngaySinh?: string; noiCap?: string; ngayCap?: string;
  ghiChuCTV?: string;
  approval?: {
    sanPham?: string; soHopDong?: string; idRlos?: string; soTienDuyet?: number;
    thucNhan?: number; laiSuat?: number; thoiHan?: number; ngayTra?: number;
    traThang?: number; bhkv?: string;
  } | null;
};

const money = (n: number) => (n != null ? n.toLocaleString("vi-VN") + " đ" : "—");

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<{ id: string; hoTen: string }[]>([]);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const user = useUser();

  useEffect(() => {
    fetch("/api/leads", { headers: authHeaders() }).then((r) => r.json()).then(setLeads);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  const name = (id: string | null) => users.find((u) => u.id === id)?.hoTen || "—";
  const filtered = leads.filter((l) => {
    if (st && String(l.statusId) !== st) return false;
    if (q) {
      const s = q.toLowerCase();
      return (
        l.hoTen.toLowerCase().includes(s) ||
        l.sdt.includes(s) ||
        l.id.toLowerCase().includes(s) ||
        (l.cccd || "").includes(s) ||
        (l.idRlos || "").toLowerCase().includes(s)
      );
    }
    return true;
  });


  function exportExcel() {
    const rows = filtered.map((l) => {
      const st = STATUSES.find((s) => s.id === l.statusId);
      const ap = l.approval;
      return {
        "Mã Lead": l.id,
        "Họ tên": l.hoTen,
        "SĐT": l.sdt,
        "CCCD": l.cccd,
        "Ngày sinh": l.ngaySinh || "",
        "Giới tính": l.gioiTinh || "",
        "Nơi cấp": l.noiCap || "",
        "Ngày cấp": l.ngayCap || "",
        "Tỉnh thành": l.tinhThanh || "",
        "Số tiền yêu cầu": l.soTienYeuCau,
        "ID RLOS": l.idRlos || ap?.idRlos || "",
        "CTV": name(l.ctvId),
        "TSA": name(l.tsaId),
        "Trạng thái": st?.name || "",
        "Sản phẩm": ap?.sanPham || "",
        "Số hợp đồng": ap?.soHopDong || "",
        "Số tiền duyệt": ap?.soTienDuyet ?? "",
        "Thực nhận": ap?.thucNhan ?? "",
        "Lãi suất %": ap?.laiSuat ?? "",
        "Thời hạn (tháng)": ap?.thoiHan ?? "",
        "Ngày trả": ap?.ngayTra ?? "",
        "Trả hàng tháng": ap?.traThang ?? "",
        "BHKV": ap?.bhkv || "",
        "Ghi chú CTV": l.ghiChuCTV || "",
        "Ngày tạo": new Date(l.createdAt).toLocaleString("vi-VN"),
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const colWidths = Object.keys(rows[0] || { A: 1 }).map((k) => ({ wch: Math.max(12, k.length + 2) }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `Bao_cao_Lead_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách Lead</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} lead</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-sm font-medium transition">
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
          {(user?.role === "CTV" || user?.role === "Admin") && (
            <Link href="/leads/import"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft transition">
              <Plus size={16} /> Import Lead
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, SĐT, CCCD, mã Lead, ID RLOS..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-nn-500 focus:ring-4 focus:ring-nn-500/10" />
        </div>
        <select value={st} onChange={(e) => setSt(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Mã Lead</th>
              <th className="px-4 py-3 font-medium">Họ tên</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">CCCD</th>
              <th className="px-4 py-3 font-medium">ID RLOS</th>
              <th className="px-4 py-3 font-medium">Số tiền YC</th>
              <th className="px-4 py-3 font-medium">Tỉnh</th>
              <th className="px-4 py-3 font-medium">CTV</th>
              <th className="px-4 py-3 font-medium">TSA</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{l.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{l.hoTen}</td>
                <td className="px-4 py-3">{l.sdt}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.cccd}</td>
                <td className="px-4 py-3 font-mono text-xs text-nn-700">{l.idRlos || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{money(l.soTienYeuCau)}</td>
                <td className="px-4 py-3 text-slate-600">{l.tinhThanh || "—"}</td>
                <td className="px-4 py-3">{name(l.ctvId)}</td>
                <td className="px-4 py-3">{name(l.tsaId)}</td>
                <td className="px-4 py-3"><StatusBadge statusId={l.statusId} /></td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/leads/${l.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nn-50 text-nn-700 text-xs font-medium hover:bg-nn-100 transition">
                    <Eye size={13} /> Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-16 text-center text-slate-400">Không có lead</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
