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
    sanPham?: string; soHopDong?: string; ngayGiaiNgan?: string; idRlos?: string;
    soTienDuyet?: number; thucNhan?: number; laiSuat?: number; thoiHan?: number;
    ngayTra?: number; traThang?: number; bhkv?: string;
  } | null;
};

const money = (n: number | undefined | null) =>
  n != null && !isNaN(Number(n)) ? Number(n).toLocaleString("vi-VN") + " đ" : "—";

type ColKey =
  | "id" | "hoTen" | "sdt" | "cccd" | "idRlos" | "soTienYeuCau" | "tinhThanh"
  | "gioiTinh" | "ngaySinh" | "ctv" | "tsa" | "status" | "sanPham" | "soHopDong"
  | "ngayGiaiNgan" | "soTienDuyet" | "createdAt";

const ALL_COLS: { key: ColKey; label: string; defaultOn: boolean }[] = [
  { key: "id", label: "Mã Lead", defaultOn: true },
  { key: "hoTen", label: "Họ tên", defaultOn: true },
  { key: "sdt", label: "SĐT", defaultOn: true },
  { key: "cccd", label: "CCCD", defaultOn: false },
  { key: "idRlos", label: "ID RLOS", defaultOn: true },
  { key: "soTienYeuCau", label: "Số tiền YC", defaultOn: true },
  { key: "tinhThanh", label: "Tỉnh thành", defaultOn: false },
  { key: "gioiTinh", label: "Giới tính", defaultOn: false },
  { key: "ngaySinh", label: "Ngày sinh", defaultOn: false },
  { key: "ctv", label: "CTV", defaultOn: true },
  { key: "tsa", label: "TSA", defaultOn: true },
  { key: "status", label: "Trạng thái", defaultOn: true },
  { key: "sanPham", label: "Sản phẩm", defaultOn: false },
  { key: "soHopDong", label: "Số hợp đồng", defaultOn: false },
  { key: "ngayGiaiNgan", label: "Ngày giải ngân", defaultOn: true },
  { key: "soTienDuyet", label: "Số tiền duyệt", defaultOn: false },
  { key: "createdAt", label: "Ngày tạo", defaultOn: true },
];

const STORAGE_KEY = "nnf_lead_cols_v2";

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

function dayKey(iso: string) {
  if (!iso) return "";
  // support YYYY-MM-DD or full ISO
  return iso.slice(0, 10);
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<{ id: string; hoTen: string }[]>([]);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateField, setDateField] = useState<"createdAt" | "ngayGiaiNgan">("createdAt");
  const [cols, setCols] = useState<Record<ColKey, boolean>>(loadCols);
  const [colOpen, setColOpen] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  useEffect(() => {
    fetch("/api/leads", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setLeads(Array.isArray(d) ? d : []));
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : []));
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
      if (!(
        l.hoTen.toLowerCase().includes(s) ||
        l.sdt.includes(s) ||
        l.id.toLowerCase().includes(s) ||
        (l.cccd || "").includes(s) ||
        (l.idRlos || "").toLowerCase().includes(s) ||
        (l.approval?.soHopDong || "").toLowerCase().includes(s)
      )) return false;
    }
    // date range
    if (dateFrom || dateTo) {
      let d = "";
      if (dateField === "ngayGiaiNgan") {
        d = dayKey(l.approval?.ngayGiaiNgan || "");
        if (!d) return false; // no disbursement date → exclude when filtering by it
      } else {
        d = dayKey(l.createdAt || "");
      }
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
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
      case "ngayGiaiNgan": return l.approval?.ngayGiaiNgan || "—";
      case "soTienDuyet": return money(l.approval?.soTienDuyet);
      case "createdAt": return <span className="text-slate-400 text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString("vi-VN")}</span>;
      default: return "—";
    }
  }

  function exportExcel() {
    if (filtered.length === 0) {
      alert("Không có dữ liệu trong bộ lọc hiện tại. Chọn lại khoảng ngày / trạng thái.");
      return;
    }
    const rows = filtered.map((l) => {
      const stName = STATUSES.find((s) => s.id === l.statusId)?.name || "";
      const ap = l.approval || {};
      return {
        "Mã Lead": l.id || "",
        "Họ tên": l.hoTen || "",
        "SĐT": l.sdt || "",
        "CCCD": l.cccd || "",
        "Ngày sinh": l.ngaySinh || "",
        "Giới tính": l.gioiTinh || "",
        "Nơi cấp": l.noiCap || "",
        "Ngày cấp": l.ngayCap || "",
        "Tỉnh thành": l.tinhThanh || "",
        "Số tiền yêu cầu": l.soTienYeuCau ?? "",
        "ID RLOS": l.idRlos || ap.idRlos || "",
        "CTV": name(l.ctvId),
        "TSA": name(l.tsaId),
        "Trạng thái": stName,
        "Sản phẩm": ap.sanPham || "",
        "Số hợp đồng": ap.soHopDong || "",
        "Ngày giải ngân": ap.ngayGiaiNgan || "",
        "Số tiền duyệt": ap.soTienDuyet ?? "",
        "Thực nhận": ap.thucNhan ?? "",
        "Lãi suất %": ap.laiSuat ?? "",
        "Thời hạn (tháng)": ap.thoiHan ?? "",
        "Ngày trả": ap.ngayTra ?? "",
        "Trả hàng tháng": ap.traThang ?? "",
        "BHKV": ap.bhkv || "",
        "Ghi chú CTV": l.ghiChuCTV || "",
        "Ngày tạo": l.createdAt ? new Date(l.createdAt).toLocaleString("vi-VN") : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const keys = Object.keys(rows[0]);
    ws["!cols"] = keys.map((k) => ({ wch: Math.min(28, Math.max(12, k.length + 2)) }));
    const fromTag = dateFrom || "all";
    const toTag = dateTo || "all";
    XLSX.writeFile(wb, `Bao_cao_Lead_${fromTag}_${toTag}.xlsx`);
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh sách Lead</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} / {leads.length} lead</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative" ref={colRef}>
            <button onClick={() => setColOpen(!colOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium">
              <Columns3 size={15} /> Cột
            </button>
            {colOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 p-2.5 animate-slide-up">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Cột hiển thị</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={showAll} className="text-[11px] text-nn-600 hover:underline">Tất cả</button>
                    <button type="button" onClick={resetCols} className="text-[11px] text-slate-400 hover:underline">Mặc định</button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-0.5">
                  {ALL_COLS.map((c) => (
                    <button key={c.key} type="button" onClick={() => toggleCol(c.key)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-left text-sm">
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        cols[c.key] ? "bg-nn-600 border-nn-600 text-white" : "border-slate-300"
                      }`}>
                        {cols[c.key] && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span className={cols[c.key] ? "text-slate-800" : "text-slate-400"}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={exportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
            <FileSpreadsheet size={15} /> Xuất Excel
          </button>
          {(user?.role === "CTV" || user?.role === "Admin") && (
            <Link href="/leads/import"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-nn-700 hover:bg-nn-600 text-white rounded-lg text-sm font-medium">
              <Plus size={15} /> Import
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-3 mb-4">
        <div className="flex flex-wrap gap-2.5 items-end">
          <div className="relative flex-1 min-w-[160px]">
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Tìm kiếm</label>
            <Search className="absolute left-2.5 bottom-2.5 w-3.5 h-3.5 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên, SĐT, CCCD, mã, RLOS, HĐ..."
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Trạng thái</label>
            <select value={st} onChange={(e) => setSt(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-sm min-w-[140px]">
              <option value="">Tất cả</option>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Lọc theo</label>
            <select value={dateField} onChange={(e) => setDateField(e.target.value as any)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="createdAt">Ngày tạo</option>
              <option value="ngayGiaiNgan">Ngày giải ngân</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Từ ngày</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Đến ngày</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          {(dateFrom || dateTo || st || q) && (
            <button type="button"
              onClick={() => { setDateFrom(""); setDateTo(""); setSt(""); setQ(""); }}
              className="px-2.5 py-2 text-xs text-slate-500 hover:text-nn-600 border border-slate-200 rounded-lg">
              Xóa lọc
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          Xuất Excel chỉ lấy <b>{filtered.length}</b> lead đang lọc
          {dateFrom || dateTo ? ` · ${dateField === "ngayGiaiNgan" ? "Ngày GN" : "Ngày tạo"}: ${dateFrom || "…"} → ${dateTo || "…"}` : ""}.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400 bg-slate-50/60">
              {visible.map((c) => (
                <th key={c.key} className="px-3 py-2.5 font-medium whitespace-nowrap text-xs uppercase tracking-wide">{c.label}</th>
              ))}
              <th className="px-3 py-2.5"></th>
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-nn-50 text-nn-700 text-xs font-medium hover:bg-nn-100">
                    <Eye size={12} /> Xem
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={visible.length + 1} className="px-4 py-14 text-center text-slate-400 text-sm">
                  Không có lead trong bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
