"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

type Lead = { id: string; hoTen: string; ctvId: string; tsaId: string | null; statusId: number };

export default function AssignPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<{ id: string; hoTen: string; role: string }[]>([]);
  const [sel, setSel] = useState<Record<string, string>>({});

  async function load() {
    const [l, u] = await Promise.all([
      fetch("/api/leads", { headers: authHeaders() as HeadersInit }).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setLeads(l.filter((x: Lead) => !x.tsaId && ![2, 3, 9].includes(x.statusId)));
    setUsers(u);
  }
  useEffect(() => { load(); }, []);

  const name = (id: string) => users.find((u) => u.id === id)?.hoTen || "—";
  const tsas = users.filter((u) => u.role === "TSA");

  async function assign(leadId: string) {
    const tsaId = sel[leadId];
    if (!tsaId) { alert("Chọn TSA"); return; }
    await fetch(`/api/leads/${leadId}/assign`, {
      method: "PATCH",
      headers: authHeaders() as HeadersInit,
      body: JSON.stringify({ tsaId }),
    });
    load();
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Phân bổ Lead cho TSA</h1>
      <p className="text-sm text-slate-500 mb-6">Gán thủ công – không random. Chỉ hiện Lead chưa gán TSA.</p>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">CTV</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Gán TSA</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/leads/${l.id}`} className="text-brand hover:underline">{l.id}</Link>
                </td>
                <td className="px-4 py-3 font-medium">{l.hoTen}</td>
                <td className="px-4 py-3">{name(l.ctvId)}</td>
                <td className="px-4 py-3"><StatusBadge statusId={l.statusId} /></td>
                <td className="px-4 py-3">
                  <select
                    value={sel[l.id] || ""}
                    onChange={(e) => setSel({ ...sel, [l.id]: e.target.value })}
                    className="px-2 py-1.5 border rounded-lg text-sm"
                  >
                    <option value="">-- Chọn --</option>
                    {tsas.map((t) => <option key={t.id} value={t.id}>{t.hoTen}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => assign(l.id)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-400">
                    Gán
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Không có lead cần gán</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
