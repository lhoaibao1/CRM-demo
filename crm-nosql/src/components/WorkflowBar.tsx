"use client";
import { PIPELINE, STATUSES } from "@/lib/store";
import { Check, X, RotateCcw } from "lucide-react";

export default function WorkflowBar({ statusId }: { statusId: number }) {
  const st = STATUSES.find((s) => s.id === statusId);
  const isClosed = st?.step === "No Pass" || st?.step === "Close";
  const isReturn = statusId === 10;

  // Map current status to pipeline index
  let currentIdx = PIPELINE.findIndex((p) => p.id === statusId);
  if (statusId === 2 || statusId === 3) currentIdx = 0; // failed at check
  if (statusId === 7) currentIdx = 3; // failed at thẩm định
  if (statusId === 10) {
    // return - show last pass step before return from history would be better; approximate
    currentIdx = -1;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 text-sm">Workflow · Step</h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            st?.step === "Pass" || st?.step === "Start" ? "bg-emerald-50 text-emerald-700" :
            st?.step === "No Pass" || st?.step === "Close" ? "bg-rose-50 text-rose-700" :
            "bg-orange-50 text-orange-700"
          }`}>
            Step: {st?.step || "—"}
          </span>
          <span className="text-xs text-slate-500">{st?.name}</span>
        </div>
      </div>

      {isReturn && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-sm">
          <RotateCcw size={14} /> Hồ sơ đang trả về Sale — CTV bổ sung rồi đẩy lại
        </div>
      )}

      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {PIPELINE.map((step, i) => {
          const done = currentIdx > i || (statusId === 9 && i <= 5);
          const active = currentIdx === i && !isClosed;
          const failed = isClosed && currentIdx === i;
          return (
            <div key={step.id} className="flex items-center min-w-0">
              <div className="flex flex-col items-center min-w-[72px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  failed ? "bg-rose-500 border-rose-500 text-white" :
                  done ? "bg-nn-600 border-nn-600 text-white" :
                  active ? "bg-white border-nn-600 text-nn-700 ring-4 ring-nn-100" :
                  "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  {failed ? <X size={14} /> : done ? <Check size={14} /> : i + 1}
                </div>
                <div className={`mt-1.5 text-[10px] font-medium text-center leading-tight ${
                  active ? "text-nn-700" : done ? "text-slate-600" : "text-slate-400"
                }`}>{step.label}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mb-4 shrink-0 ${done ? "bg-nn-500" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
