"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sai tài khoản hoặc mật khẩu");
      localStorage.setItem("nnf_user", JSON.stringify(data));
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Lỗi đăng nhập");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-gradient-to-br from-nn-950 via-nn-800 to-nn-600 overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,162,39,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(12,140,231,0.4) 0%, transparent 40%)" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Logo size="lg" light />
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Quản lý Lead<br />
              <span className="text-gold-light">chuyên nghiệp</span>
            </h1>
            <p className="text-nn-100/80 text-lg max-w-sm leading-relaxed">
              Hệ thống CRM nội bộ dành cho đội ngũ CTV, TSA và Admin của Nhật Nam Finance.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-nn-200/70">
            <div><div className="text-2xl font-bold text-white">3</div>Vai trò</div>
            <div><div className="text-2xl font-bold text-white">10</div>Trạng thái</div>
            <div><div className="text-2xl font-bold text-white">24/7</div>Theo dõi</div>
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] animate-fade-in">
          <div className="lg:hidden mb-8"><Logo size="md" /></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Đăng nhập</h2>
          <p className="text-slate-500 text-sm mb-8">Nhập tài khoản để tiếp tục vào hệ thống</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  required autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:border-nn-500 focus:ring-4 focus:ring-nn-500/10 transition"
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:border-nn-500 focus:ring-4 focus:ring-nn-500/10 transition"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{err}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-nn-700 hover:bg-nn-600 text-white font-semibold text-sm shadow-soft transition disabled:opacity-60">
              {loading ? "Đang đăng nhập..." : <>Đăng nhập <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

