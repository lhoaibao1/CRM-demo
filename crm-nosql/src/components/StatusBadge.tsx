import { STATUSES } from "@/lib/store";
const map: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
};
export default function StatusBadge({ statusId }: { statusId: number }) {
  const st = STATUSES.find((s) => s.id === statusId);
  if (!st) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${map[st.color] || map.slate}`}>
      {st.name}
    </span>
  );
}
