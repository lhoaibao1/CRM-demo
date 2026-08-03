"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function AssignPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  async function load() {
    const [l, u] = await Promise.all([
      fetch("/api/leads", { headers: authHeaders() }).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    // Admin: tất cả Lead — gán/đổi TSA bất kỳ
    setLeads(l);
    setUsers(u);
    const init: Record<string, string> = {};
    l.forEach((x: any) => { if (x.tsaId) init[x.id] = x.tsaId; });
    setSel(init);
  }
  useEffect(() => { load(); }, []);

  const name = (id: string | null) => users.find((u: any) => u.id === id)?.hoTen || "—";
  const tsas = users.filter((u: any) => u.role === "TSA");
  const filtered = leads.filter((l) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return l.hoTen.toLowerCase().includes(s) || l.id.toLowerCase().includes(s) || (l.sdt || "").includes(s);
  });

  async function assign(leadId: string) {
    if (!sel[leadId]) { alert("Chọn TSA"); return; }
    await fetch(`/api/leads/${leadId}/assign`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ tsaId: sel[leadId] }),
    });
    load();
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Phân bổ Lead</h1>
      <p className="text-sm text-slate-500 mb-4">Admin gán / đổi TSA cho <b>mọi Lead</b> ở bất kỳ trạng thái nào</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm Lead..."
        className="mb-4 w-full max-w-sm px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-5 py-3.5 font-medium">Lead</th>
              <th className="px-5 py-3.5 font-medium">CTV</th>
              <th className="px-5 py-3.5 font-medium">TSA hiện tại</th>
              <th className="px-5 py-3.5 font-medium">Trạng thái</th>
              <th className="px-5 py-3.5 font-medium">Gán / Đổi TSA</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l: any) => (
              <tr key={l.id} className="border-b border-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/leads/${l.id}`} className="font-medium text-nn-700 hover:underline">{l.hoTen}</Link>
                  <div className="text-xs text-slate-400 font-mono">{l.id}</div>
                </td>
                <td className="px-5 py-3">{name(l.ctvId)}</td>
                <td className="px-5 py-3">{name(l.tsaId)}</td>
                <td className="px-5 py-3"><StatusBadge statusId={l.statusId} /></td>
                <td className="px-5 py-3">
                  <select value={sel[l.id] || ""} onChange={(e) => setSel({ ...sel, [l.id]: e.target.value })}
                    className="px-2.5 py-1.5 border rounded-lg text-sm">
                    <option value="">-- Chọn --</option>
                    {tsas.map((t: any) => <option key={t.id} value={t.id}>{t.hoTen}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => assign(l.id)}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-400">
                    {l.tsaId ? "Đổi" : "Gán"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Không có lead</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
