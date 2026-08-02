"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders, useUser } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { STATUSES } from "@/lib/store";
import { Search, Plus, Eye } from "lucide-react";

type Lead = { id: string; hoTen: string; sdt: string; ctvId: string; tsaId: string | null; statusId: number; createdAt: string; soTienYeuCau: number };

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
      return l.hoTen.toLowerCase().includes(s) || l.sdt.includes(s) || l.id.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách Lead</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} lead</p>
        </div>
        {(user?.role === "CTV" || user?.role === "Admin") && (
          <Link href="/leads/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft transition">
            <Plus size={16} /> Import Lead
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm họ tên, SĐT, mã lead..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-nn-500 focus:ring-4 focus:ring-nn-500/10" />
        </div>
        <select value={st} onChange={(e) => setSt(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-5 py-3.5 font-medium">Lead</th>
              <th className="px-5 py-3.5 font-medium">SĐT</th>
              <th className="px-5 py-3.5 font-medium hidden md:table-cell">CTV</th>
              <th className="px-5 py-3.5 font-medium hidden lg:table-cell">TSA</th>
              <th className="px-5 py-3.5 font-medium">Trạng thái</th>
              <th className="px-5 py-3.5 font-medium hidden sm:table-cell">Ngày tạo</th>
              <th className="px-5 py-3.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-800">{l.hoTen}</div>
                  <div className="text-xs text-slate-400 font-mono">{l.id}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{l.sdt}</td>
                <td className="px-5 py-3.5 hidden md:table-cell text-slate-600">{name(l.ctvId)}</td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-slate-600">{name(l.tsaId)}</td>
                <td className="px-5 py-3.5"><StatusBadge statusId={l.statusId} /></td>
                <td className="px-5 py-3.5 hidden sm:table-cell text-slate-400 text-xs">
                  {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/leads/${l.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nn-50 text-nn-700 text-xs font-medium hover:bg-nn-100 transition">
                    <Eye size={13} /> Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400">Không có lead</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
