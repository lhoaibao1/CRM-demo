"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders, useUser } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { STATUSES } from "@/lib/store";

type Lead = {
  id: string; hoTen: string; sdt: string; ctvId: string; tsaId: string | null;
  statusId: number; createdAt: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<{ id: string; hoTen: string }[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const user = useUser();

  useEffect(() => {
    fetch("/api/leads", { headers: authHeaders() as HeadersInit }).then((r) => r.json()).then(setLeads);
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  const name = (id: string | null) => users.find((u) => u.id === id)?.hoTen || "—";
  const filtered = leads.filter((l) => {
    if (status && String(l.statusId) !== status) return false;
    if (q) {
      const s = q.toLowerCase();
      return l.hoTen.toLowerCase().includes(s) || l.sdt.includes(s) || l.id.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Danh sách Lead</h1>
        {(user?.role === "CTV" || user?.role === "Admin") && (
          <Link href="/leads/import" className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light">
            + Import Lead
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm họ tên / SĐT / mã lead..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Mã Lead</th>
              <th className="px-4 py-3 font-medium">Họ tên</th>
              <th className="px-4 py-3 font-medium">SĐT</th>
              <th className="px-4 py-3 font-medium">CTV</th>
              <th className="px-4 py-3 font-medium">TSA</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 font-medium">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{l.id}</td>
                <td className="px-4 py-3 font-medium">{l.hoTen}</td>
                <td className="px-4 py-3">{l.sdt}</td>
                <td className="px-4 py-3">{name(l.ctvId)}</td>
                <td className="px-4 py-3">{name(l.tsaId)}</td>
                <td className="px-4 py-3"><StatusBadge statusId={l.statusId} /></td>
                <td className="px-4 py-3 text-slate-500">{new Date(l.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3">
                  <Link href={`/leads/${l.id}`} className="inline-flex px-3 py-1 rounded-md bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20">
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">Không có lead</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
