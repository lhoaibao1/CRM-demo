"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

type Lead = { id: string; hoTen: string; statusId: number; updatedAt: string };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/leads", { headers: authHeaders() as HeadersInit })
      .then((r) => r.json())
      .then(setLeads)
      .catch(console.error);
  }, []);

  const total = leads.length;
  const processing = leads.filter((l) => [1, 4, 5, 6].includes(l.statusId)).length;
  const approved = leads.filter((l) => [8, 9].includes(l.statusId)).length;
  const rejected = leads.filter((l) => [2, 3, 7].includes(l.statusId)).length;
  const recent = [...leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  const cards = [
    { label: "Tổng Lead", value: total, color: "text-brand" },
    { label: "Đang xử lý", value: processing, color: "text-sky-600" },
    { label: "Đã duyệt / END", value: approved, color: "text-emerald-600" },
    { label: "Từ chối / Nợ xấu", value: rejected, color: "text-red-600" },
  ];

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-sm text-slate-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold">Lead gần đây</h2>
          <Link href="/leads" className="text-sm text-brand hover:underline">Xem tất cả →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Mã</th>
              <th className="px-5 py-3 font-medium">Họ tên</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
              <th className="px-5 py-3 font-medium">Cập nhật</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((l) => (
              <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-mono text-xs">{l.id}</td>
                <td className="px-5 py-3 font-medium">{l.hoTen}</td>
                <td className="px-5 py-3"><StatusBadge statusId={l.statusId} /></td>
                <td className="px-5 py-3 text-slate-500">{new Date(l.updatedAt).toLocaleString("vi-VN")}</td>
                <td className="px-5 py-3">
                  <Link href={`/leads/${l.id}`} className="text-brand hover:underline text-sm">Chi tiết</Link>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Chưa có lead</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
