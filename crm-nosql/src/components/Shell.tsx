"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import {
  LayoutDashboard, Users, FilePlus2, UserCog, Settings,
  LogOut, ChevronRight, Menu, X
} from "lucide-react";

type User = { id: string; hoTen: string; role: string; username: string };

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin","TSA","CTV"] },
  { href: "/leads", label: "Danh sách Lead", icon: Users, roles: ["Admin","TSA","CTV"] },
  { href: "/leads/import", label: "Import Lead", icon: FilePlus2, roles: ["CTV","Admin"] },
  { href: "/assign", label: "Phân bổ Lead", icon: UserCog, roles: ["Admin"] },
  { href: "/settings", label: "Cài đặt", icon: Settings, roles: ["Admin"] },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("nnf_user");
    if (!raw) { router.replace("/"); return; }
    setUser(JSON.parse(raw));
  }, [router]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-nn-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const items = NAV.filter((n) => n.roles.includes(user.role));

  function logout() {
    localStorage.removeItem("nnf_user");
    router.replace("/");
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <Logo size="sm" light />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((n) => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href + "/")) || (n.href === "/leads" && pathname.startsWith("/leads/") && !pathname.includes("import"));
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active ? "bg-white/15 text-white font-medium" : "text-nn-100/70 hover:bg-white/10 hover:text-white"
              }`}>
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {n.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-nn-950 font-bold text-sm">
            {user.hoTen.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{user.hoTen}</div>
            <div className="text-xs text-nn-200/60">{user.role} · @{user.username}</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-nn-100/60 hover:bg-white/10 hover:text-white transition">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 shrink-0 bg-gradient-to-b from-nn-950 to-nn-900 text-white flex-col fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-nn-950 to-nn-900 text-white">
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        <header className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-slate-100"><Menu size={20} /></button>
          <Logo size="sm" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

export function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("nnf_user");
  if (!raw) return {};
  const u = JSON.parse(raw);
  return { "X-User-Id": u.id, "Content-Type": "application/json" };
}

export function useUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("nnf_user");
  return raw ? JSON.parse(raw) : null;
}
