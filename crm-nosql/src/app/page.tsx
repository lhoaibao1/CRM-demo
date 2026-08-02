"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLES = [
  { role: "Admin", label: "Admin", desc: "Full quyền · Gán Lead · Quản lý", color: "bg-brand hover:bg-brand-light" },
  { role: "TSA", label: "TSA", desc: "Xử lý hồ sơ được phân bổ", color: "bg-sky-600 hover:bg-sky-500" },
  { role: "CTV", label: "CTV", desc: "Import Lead · Theo dõi của mình", color: "bg-orange-500 hover:bg-orange-400" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function login(role: string) {
    setLoading(role);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Login failed");
      const user = await res.json();
      localStorage.setItem("crm_user", JSON.stringify(user));
      router.push("/dashboard");
    } catch {
      alert("Đăng nhập thất bại");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand via-brand-light to-sky-400 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold tracking-widest text-brand mb-2">3RD</div>
          <h1 className="text-xl font-semibold text-slate-800">CRM Nội bộ</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý Lead & Hồ sơ vay</p>
        </div>
        <div className="space-y-3">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => login(r.role)}
              disabled={!!loading}
              className={`w-full text-left px-5 py-4 rounded-xl text-white transition ${r.color} disabled:opacity-60`}
            >
              <div className="font-semibold text-lg">
                {loading === r.role ? "Đang đăng nhập..." : r.label}
              </div>
              <div className="text-sm opacity-90">{r.desc}</div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Demo · Dữ liệu lưu trên server</p>
      </div>
    </div>
  );
}
