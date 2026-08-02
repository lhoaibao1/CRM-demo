"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";
import {
  LayoutDashboard, Users, FilePlus2, UserCog, Settings,
  LogOut, ChevronRight, Menu, Bell, Check
} from "lucide-react";

type User = { id: string; hoTen: string; role: string; username: string };
type Notif = { id: string; title: string; body: string; leadId?: string; read: boolean; createdAt: string };

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
  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("nnf_user");
    if (!raw) { router.replace("/"); return; }
    setUser(JSON.parse(raw));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      fetch("/api/notifications", { headers: authHeaders() })
        .then((r) => r.json())
        .then((d) => { setNotifs(d.items || []); setUnread(d.unread || 0); })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    function click(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

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

  async function markAll() {
    await fetch("/api/notifications", { method: "PATCH", headers: authHeaders(), body: "{}" });
    setUnread(0);
    setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <Logo size="sm" light />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map((n) => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                active ? "bg-white/15 text-white font-medium shadow-inner" : "text-nn-100/70 hover:bg-white/10 hover:text-white"
              }`}>
              <Icon size={18} className="shrink-0" />
              {n.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-nn-950 font-bold text-sm shadow">
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
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden md:flex w-60 shrink-0 bg-gradient-to-b from-nn-950 via-nn-900 to-nn-950 text-white flex-col fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-nn-950 to-nn-900 text-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100"><Menu size={20} /></button>
            <div className="md:hidden"><Logo size="sm" /></div>
          </div>
          <div className="relative" ref={bellRef}>
            <button onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition">
              <Bell size={20} className="text-slate-600" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                  <span className="font-semibold text-sm">Thông báo</span>
                  {unread > 0 && (
                    <button onClick={markAll} className="text-xs text-nn-600 hover:underline flex items-center gap-1">
                      <Check size={12} /> Đã đọc tất cả
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 && <div className="px-4 py-10 text-center text-sm text-slate-400">Chưa có thông báo</div>}
                  {notifs.map((n) => (
                    <button key={n.id} onClick={() => { if (n.leadId) { router.push("/leads/" + n.leadId); setBellOpen(false); } }}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${!n.read ? "bg-nn-50/50" : ""}`}>
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-nn-500 shrink-0" />}
                        <div className={!n.read ? "" : "pl-4"}>
                          <div className="text-sm font-medium text-slate-800">{n.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{n.body}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString("vi-VN")}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
