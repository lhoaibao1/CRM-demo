"use client";
import { useEffect, useState, useRef } from "react";
import Shell, { authHeaders, useUser } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { STATUSES } from "@/lib/store";
import { Search, Plus, Eye, FileSpreadsheet, Columns3, Check } from "lucide-react";
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

type ColKey =
  | "id" | "hoTen" | "sdt" | "cccd" | "idRlos" | "soTienYeuCau" | "tinhThanh"
  | "gioiTinh" | "ngaySinh" | "ctv" | "tsa" | "status" | "sanPham" | "soHopDong"
  | "soTienDuyet" | "createdAt";

const ALL_COLS: { key: ColKey; label: string; defaultOn: boolean }[] = [
  { key: "id", label: "Mã Lead", defaultOn: true },
  { key: "hoTen", label: "Họ tên", defaultOn: true },
  { key: "sdt", label: "SĐT", defaultOn: true },
  { key: "cccd", label: "CCCD", defaultOn: true },
  { key: "idRlos", label: "ID RLOS", defaultOn: true },
  { key: "soTienYeuCau", label: "Số tiền YC", defaultOn: true },
  { key: "tinhThanh", label: "Tỉnh thành", defaultOn: true },
  { key: "gioiTinh", label: "Giới tính", defaultOn: false },
  { key: "ngaySinh", label: "Ngày sinh", defaultOn: false },
  { key: "ctv", label: "CTV", defaultOn: true },
  { key: "tsa", label: "TSA", defaultOn: true },
  { key: "status", label: "Trạng thái", defaultOn: true },
  { key: "sanPham", label: "Sản phẩm", defaultOn: false },
  { key: "soHopDong", label: "Số hợp đồng", defaultOn: false },
  { key: "soTienDuyet", label: "Số tiền duyệt", defaultOn: false },
  { key: "createdAt", label: "Ngày tạo", defaultOn: true },
];

const STORAGE_KEY = "nnf_lead_cols";

function loadCols(): Record<ColKey, boolean> {
  const base = Object.fromEntries(ALL_COLS.map((c) => [c.key, c.defaultOn])) as Record<ColKey, boolean>;
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    return { ...base, ...JSON.parse(raw) };
  } catch {
    return base;
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<{ id: string; hoTen: string }[]>([]);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [cols, setCols] = useState<Record<ColKey, boolean>>(loadCols);
  const [colOpen, setColOpen] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  useEffect(() => {
    fetch("/api/leads", { headers: authHeaders() }).then((r) => r.json()).then(setLeads);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  useEffect(() => {
    function click(e: MouseEvent) {
      if (colRef.current && !colRef.current.contains(e.target as Node)) setColOpen(false);
    }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  function toggleCol(key: ColKey) {
    setCols((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function resetCols() {
    const base = Object.fromEntries(ALL_COLS.map((c) => [c.key, c.defaultOn])) as Record<ColKey, boolean>;
    setCols(base);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
  }

  function showAll() {
    const all = Object.fromEntries(ALL_COLS.map((c) => [c.key, true])) as Record<ColKey, boolean>;
    setCols(all);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

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
        (l.idRlos || "").toLowerCase().includes(s) ||
        (l.approval?.soHopDong || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  const visible = ALL_COLS.filter((c) => cols[c.key]);

  function cell(l: Lead, key: ColKey) {
    switch (key) {
      case "id": return <span className="font-mono text-xs text-slate-500">{l.id}</span>;
      case "hoTen": return <span className="font-medium text-slate-800">{l.hoTen}</span>;
      case "sdt": return l.sdt;
      case "cccd": return <span className="font-mono text-xs">{l.cccd}</span>;
      case "idRlos": return <span className="font-mono text-xs text-nn-700">{l.idRlos || "—"}</span>;
      case "soTienYeuCau": return <span className="whitespace-nowrap">{money(l.soTienYeuCau)}</span>;
      case "tinhThanh": return l.tinhThanh || "—";
      case "gioiTinh": return l.gioiTinh || "—";
      case "ngaySinh": return l.ngaySinh || "—";
      case "ctv": return name(l.ctvId);
      case "tsa": return name(l.tsaId);
      case "status": return <StatusBadge statusId={l.statusId} />;
      case "sanPham": return l.approval?.sanPham || "—";
      case "soHopDong": return <span className="font-mono text-xs">{l.approval?.soHopDong || "—"}</span>;
      case "soTienDuyet": return l.approval?.soTienDuyet != null ? money(l.approval.soTienDuyet) : "—";
      case "createdAt": return <span className="text-slate-400 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString("vi-VN")}</span>;
      default: return "—";
    }
  }

  function exportExcel() {
    const rows = filtered.map((l) => {
      const stName = STATUSES.find((s) => s.id === l.statusId)?.name || "";
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
        "Trạng thái": stName,
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
    ws["!cols"] = Object.keys(rows[0] || { A: 1 }).map((k) => ({ wch: Math.max(12, k.length + 2) }));
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
          <div className="relative" ref={colRef}>
            <button onClick={() => setColOpen(!colOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition">
              <Columns3 size={16} /> Cột hiển thị
            </button>
            {colOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-3 animate-slide-up">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tuỳ chỉnh cột</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={showAll} className="text-[11px] text-nn-600 hover:underline">Tất cả</button>
                    <button type="button" onClick={resetCols} className="text-[11px] text-slate-400 hover:underline">Mặc định</button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-0.5">
                  {ALL_COLS.map((c) => (
                    <button key={c.key} type="button" onClick={() => toggleCol(c.key)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left text-sm transition">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        cols[c.key] ? "bg-nn-600 border-nn-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {cols[c.key] && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className={cols[c.key] ? "text-slate-800" : "text-slate-400"}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, SĐT, CCCD, mã Lead, ID RLOS, số HĐ..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-nn-500 focus:ring-4 focus:ring-nn-500/10" />
        </div>
        <select value={st} onChange={(e) => setSt(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400 bg-slate-50/60">
              {visible.map((c) => (
                <th key={c.key} className="px-3 py-2.5 font-medium whitespace-nowrap text-xs uppercase tracking-wide">{c.label}</th>
              ))}
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-slate-50/80 hover:bg-nn-50/40 transition">
                {visible.map((c) => (
                  <td key={c.key} className="px-3 py-2.5">{cell(l, c.key)}</td>
                ))}
                <td className="px-3 py-2.5">
                  <Link href={`/leads/${l.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-nn-50 text-nn-700 text-xs font-medium hover:bg-nn-100 transition">
                    <Eye size={12} /> Xem
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={visible.length + 1} className="px-4 py-16 text-center text-slate-400">Không có lead</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
