"use client";
import { PIPELINE, STATUSES } from "@/lib/store";
import { Check, X, RotateCcw, PartyPopper } from "lucide-react";

export default function WorkflowBar({ statusId }: { statusId: number }) {
  const st = STATUSES.find((s) => s.id === statusId);
  const isFail = st?.step === "No Pass" || (st?.step === "Close"); // reject only
  const isDone = statusId === 9;
  const isReturn = statusId === 10;

  let currentIdx = PIPELINE.findIndex((p) => p.id === statusId);
  if (statusId === 2 || statusId === 3) currentIdx = 0;
  if (statusId === 7) currentIdx = 3;
  if (statusId === 9) currentIdx = 5;
  if (statusId === 10) currentIdx = -1;

  const stepBadge =
    isDone ? "bg-emerald-50 text-emerald-700" :
    st?.step === "Pass" || st?.step === "Start" ? "bg-emerald-50 text-emerald-700" :
    isFail ? "bg-rose-50 text-rose-700" :
    "bg-orange-50 text-orange-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 mb-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold text-slate-800 text-sm">Workflow · Step</h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stepBadge}`}>
            Step: {st?.step || "—"}
          </span>
          <span className="text-xs text-slate-500">{st?.name}</span>
        </div>
      </div>

      {isReturn && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-sm">
          <RotateCcw size={14} /> Hồ sơ trả về Sale — CTV bổ sung rồi đẩy lại
        </div>
      )}
      {isDone && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm">
          <PartyPopper size={14} /> Hoàn thành — Đã giải ngân
        </div>
      )}

      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {PIPELINE.map((step, i) => {
          const done = currentIdx > i || isDone;
          const active = currentIdx === i && !isFail && !isDone;
          const failed = isFail && currentIdx === i;
          return (
            <div key={step.id} className="flex items-center min-w-0">
              <div className="flex flex-col items-center min-w-[72px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  failed ? "bg-rose-500 border-rose-500 text-white" :
                  done ? "bg-emerald-500 border-emerald-500 text-white" :
                  active ? "bg-white border-nn-600 text-nn-700 ring-4 ring-nn-100" :
                  "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  {failed ? <X size={14} /> : done ? <Check size={14} /> : i + 1}
                </div>
                <div className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${
                  active ? "text-nn-700" : done ? "text-emerald-700" : "text-slate-400"
                }`}>{step.label}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mb-4 shrink-0 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
