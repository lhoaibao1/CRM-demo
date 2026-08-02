"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders } from "@/components/Shell";
import { UserPlus, Shield, Users, StickyNote, Trash2, Plus } from "lucide-react";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [notes, setNotes] = useState<{ code: string; content: string }[]>([]);
  const [show, setShow] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", hoTen: "", role: "CTV", sdt: "", cccd: "" });
  const [noteForm, setNoteForm] = useState({ code: "", content: "" });
  const [tab, setTab] = useState<"users" | "notes">("users");

  async function load() {
    const [u, n] = await Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/notes").then((r) => r.json()),
    ]);
    setUsers(u);
    setNotes(n);
  }
  useEffect(() => { load(); }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users", { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
    if (!res.ok) { alert((await res.json()).error); return; }
    setShow(false);
    setForm({ username: "", password: "", hoTen: "", role: "CTV", sdt: "", cccd: "" });
    load();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/notes", { method: "POST", headers: authHeaders(), body: JSON.stringify(noteForm) });
    if (!res.ok) { alert((await res.json()).error); return; }
    setNotes(await res.json());
    setShowNote(false);
    setNoteForm({ code: "", content: "" });
  }

  async function delNote(code: string) {
    if (!confirm("Xóa form " + code + "?")) return;
    const res = await fetch("/api/notes?code=" + encodeURIComponent(code), { method: "DELETE", headers: authHeaders() });
    setNotes(await res.json());
  }

  const roleColor: Record<string, string> = {
    Admin: "bg-nn-100 text-nn-800",
    TSA: "bg-sky-100 text-sky-800",
    CTV: "bg-orange-100 text-orange-800",
  };

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-500 mt-0.5">User · Form ghi chú · Phân quyền</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === "users" ? "bg-nn-700 text-white shadow-soft" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <Users size={14} className="inline mr-1.5" />Người dùng
        </button>
        <button onClick={() => setTab("notes")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === "notes" ? "bg-nn-700 text-white shadow-soft" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <StickyNote size={14} className="inline mr-1.5" />Form ghi chú
        </button>
      </div>

      {tab === "users" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShow(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft">
              <UserPlus size={16} /> Thêm user
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {["Admin", "TSA", "CTV"].map((role) => (
              <div key={role} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${roleColor[role]}`}><Shield size={16} /></div>
                  <span className="font-semibold">{role}</span>
                </div>
                <div className="text-2xl font-bold">{users.filter((u: any) => u.role === role).length}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-slate-50">
                <th className="px-5 py-3 font-medium">Họ tên</th>
                <th className="px-5 py-3 font-medium">Username</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">SĐT</th>
                <th className="px-5 py-3 font-medium">TT</th>
              </tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium">{u.hoTen}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">@{u.username}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]}`}>{u.role}</span></td>
                    <td className="px-5 py-3">{u.sdt || "—"}</td>
                    <td className="px-5 py-3 text-xs font-medium text-emerald-600">Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "notes" && (
        <>
          <div className="flex items-start justify-between gap-4 mb-4">
            <p className="text-sm text-slate-500 max-w-lg">
              Form ghi chú dùng khi chuyển trạng thái. Admin thêm mã mới tại đây — TSA/CTV sẽ thấy ngay trong dropdown.
            </p>
            <button onClick={() => setShowNote(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft shrink-0">
              <Plus size={16} /> Thêm form
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b border-slate-50">
                <th className="px-5 py-3 font-medium">Mã</th>
                <th className="px-5 py-3 font-medium">Nội dung</th>
                <th className="px-5 py-3 font-medium w-20"></th>
              </tr></thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.code} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono font-semibold text-nn-700">{n.code}</td>
                    <td className="px-5 py-3">{n.content}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => delNote(n.code)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50" title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={createUser} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="font-bold text-lg mb-4">Thêm người dùng</h3>
            <div className="space-y-3">
              {[["hoTen","Họ tên *","text"],["username","Username *","text"],["password","Mật khẩu *","password"],["sdt","SĐT","text"],["cccd","CCCD","text"]].map(([k,l,t]) => (
                <div key={k}>
                  <label className="block text-xs font-medium mb-1">{l}</label>
                  <input type={t} required={l.includes("*")} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1">Role *</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border rounded-xl text-sm">
                  <option>Admin</option><option>TSA</option><option>CTV</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShow(false)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-nn-700 text-white rounded-xl text-sm font-medium">Tạo</button>
            </div>
          </form>
        </div>
      )}

      {showNote && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={addNote} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="font-bold text-lg mb-4">Thêm form ghi chú</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Mã (vd: D03, R04) *</label>
                <input required value={noteForm.code} onChange={(e) => setNoteForm({ ...noteForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono" placeholder="D03" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Nội dung *</label>
                <input required value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Mô tả ghi chú..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={() => setShowNote(false)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-nn-700 text-white rounded-xl text-sm font-medium">Thêm</button>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}
