"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { TrendingUp, Clock, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";

type Lead = { id: string; hoTen: string; statusId: number; updatedAt: string; soTienYeuCau: number };

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  useEffect(() => {
    fetch("/api/leads", { headers: authHeaders() }).then((r) => r.json()).then(setLeads);
  }, []);

  const total = leads.length;
  const processing = leads.filter((l) => [1,4,5,6].includes(l.statusId)).length;
  const approved = leads.filter((l) => [8,9].includes(l.statusId)).length;
  const rejected = leads.filter((l) => [2,3,7].includes(l.statusId)).length;
  const recent = [...leads].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const money = (n: number) => n?.toLocaleString("vi-VN");

  const cards = [
    { label: "Tổng Lead", value: total, icon: TrendingUp, color: "from-nn-600 to-nn-700", bg: "bg-nn-50" },
    { label: "Đang xử lý", value: processing, icon: Clock, color: "from-sky-500 to-sky-600", bg: "bg-sky-50" },
    { label: "Đã duyệt", value: approved, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
    { label: "Từ chối", value: rejected, icon: XCircle, color: "from-rose-500 to-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hoạt động Lead</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-soft group hover:shadow-md transition">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${c.bg} -mr-8 -mt-8 opacity-60 group-hover:scale-110 transition`} />
              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-3 shadow`}>
                <Icon size={18} />
              </div>
              <div className="relative text-3xl font-bold text-slate-900">{c.value}</div>
              <div className="relative text-sm text-slate-500 mt-0.5">{c.label}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Lead gần đây</h2>
          <Link href="/leads" className="text-sm text-nn-600 hover:text-nn-700 font-medium flex items-center gap-1">
            Xem tất cả <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recent.map((l) => (
            <Link key={l.id} href={`/leads/${l.id}`}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/80 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nn-100 to-nn-200 flex items-center justify-center text-nn-700 font-semibold text-sm shrink-0">
                {l.hoTen.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 truncate">{l.hoTen}</div>
                <div className="text-xs text-slate-400 font-mono">{l.id}</div>
              </div>
              <div className="hidden sm:block text-sm text-slate-500">{money(l.soTienYeuCau)} đ</div>
              <StatusBadge statusId={l.statusId} />
            </Link>
          ))}
          {recent.length === 0 && <div className="px-6 py-12 text-center text-slate-400 text-sm">Chưa có lead</div>}
        </div>
      </div>
    </Shell>
  );
}
