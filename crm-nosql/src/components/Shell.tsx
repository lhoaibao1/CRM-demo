"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = { id: string; hoTen: string; role: string };

export default function Shell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("crm_user");
    if (!raw) { router.replace("/"); return; }
    setUser(JSON.parse(raw));
  }, [router]);

  function logout() {
    localStorage.removeItem("crm_user");
    router.replace("/");
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải...</div>;

  const nav = [
    { href: "/dashboard", label: "Dashboard", roles: ["Admin", "TSA", "CTV"] },
    { href: "/leads", label: "Danh sách Lead", roles: ["Admin", "TSA", "CTV"] },
    { href: "/leads/import", label: "Import Lead", roles: ["CTV", "Admin"] },
    { href: "/assign", label: "Phân bổ Lead", roles: ["Admin"] },
  ].filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 bg-brand text-white flex items-center justify-between px-5 sticky top-0 z-40 shadow">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-wide text-lg">3RD CRM</span>
          <nav className="hidden md:flex gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href))
                    ? "bg-white/20 font-medium"
                    : "hover:bg-white/10"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="opacity-90">{user.hoTen} · {user.role}</span>
          <button onClick={logout} className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-sm">
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export function useUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("crm_user");
  return raw ? JSON.parse(raw) : null;
}

export function authHeaders() {
  const raw = localStorage.getItem("crm_user");
  if (!raw) return {};
  const u = JSON.parse(raw);
  return { "X-User-Id": u.id, "Content-Type": "application/json" };
}
