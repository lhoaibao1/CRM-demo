export default function Logo({ size = "md", light = false }: { size?: "sm" | "md" | "lg"; light?: boolean }) {
  const s = size === "lg" ? 48 : size === "sm" ? 28 : 36;
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nnf" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#0c8ce7"/>
            <stop offset="1" stopColor="#0158a0"/>
          </linearGradient>
          <linearGradient id="gold" x1="0" y1="48" x2="48" y2="0">
            <stop stopColor="#E8C547"/>
            <stop offset="1" stopColor="#C9A227"/>
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#nnf)"/>
        <path d="M12 32V16h4.5l5.5 10.5L27.5 16H32v16h-3.5V22.5L24 31h-2L17.5 22.5V32H12z" fill="white"/>
        <circle cx="36" cy="34" r="5" fill="url(#gold)"/>
        <text x="36" y="37" textAnchor="middle" fontSize="7" fontWeight="700" fill="#0b3f6e">¥</text>
      </svg>
      <div className={light ? "text-white" : "text-nn-900"}>
        <div className={`font-bold tracking-tight leading-none ${text}`}>Nhật Nam</div>
        <div className={`font-medium tracking-widest uppercase opacity-70 ${size === "lg" ? "text-xs" : "text-[10px]"}`}>Finance</div>
      </div>
    </div>
  );
}
