import { STATUSES } from "@/lib/store";

const colorMap: Record<string, string> = {
  yellow: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-800",
  green: "bg-emerald-100 text-emerald-800",
  orange: "bg-orange-100 text-orange-800",
  gray: "bg-slate-100 text-slate-600",
};

export default function StatusBadge({ statusId }: { statusId: number }) {
  const st = STATUSES.find((s) => s.id === statusId);
  if (!st) return null;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[st.color] || colorMap.gray}`}>
      {st.name}
    </span>
  );
}
