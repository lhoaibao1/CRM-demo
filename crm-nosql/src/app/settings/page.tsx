"use client";
import { useEffect, useState } from "react";
import Shell, { authHeaders } from "@/components/Shell";
import { UserPlus, Shield, Users } from "lucide-react";

export default function SettingsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ username:"", password:"", hoTen:"", role:"CTV", sdt:"", cccd:"" });

  async function load() {
    const u = await fetch("/api/users").then(r=>r.json());
    setUsers(u);
  }
  useEffect(()=>{ load(); }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/users", { method:"POST", headers: authHeaders(), body: JSON.stringify(form) });
    if (!res.ok) { alert((await res.json()).error); return; }
    setShow(false);
    setForm({ username:"", password:"", hoTen:"", role:"CTV", sdt:"", cccd:"" });
    load();
  }

  const roleColor: Record<string,string> = {
    Admin: "bg-nn-100 text-nn-800",
    TSA: "bg-sky-100 text-sky-800",
    CTV: "bg-orange-100 text-orange-800",
  };

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý người dùng & phân quyền</p>
        </div>
        <button onClick={()=>setShow(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft">
          <UserPlus size={16}/> Thêm user
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {["Admin","TSA","CTV"].map((role)=>(
          <div key={role} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-soft">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${roleColor[role]}`}>
                <Shield size={16}/>
              </div>
              <span className="font-semibold">{role}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{users.filter((u:any)=>u.role===role).length}</div>
            <div className="text-xs text-slate-400">người dùng</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
          <Users size={16} className="text-slate-400"/>
          <h2 className="font-semibold">Danh sách người dùng</h2>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b border-slate-50">
            <th className="px-5 py-3 font-medium">Họ tên</th>
            <th className="px-5 py-3 font-medium">Username</th>
            <th className="px-5 py-3 font-medium">Role</th>
            <th className="px-5 py-3 font-medium">SĐT</th>
            <th className="px-5 py-3 font-medium">Trạng thái</th>
          </tr></thead>
          <tbody>
            {users.map((u:any)=>(
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium">{u.hoTen}</td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">@{u.username}</td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]}`}>{u.role}</span></td>
                <td className="px-5 py-3 text-slate-600">{u.sdt||"—"}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium ${u.active!==false?"text-emerald-600":"text-slate-400"}`}>
                    {u.active!==false?"Active":"Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={createUser} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="font-bold text-lg mb-4">Thêm người dùng</h3>
            <div className="space-y-3">
              {[
                ["hoTen","Họ tên *","text"],["username","Username *","text"],["password","Mật khẩu *","password"],
                ["sdt","Số điện thoại","text"],["cccd","CCCD","text"],
              ].map(([k,l,t])=>(
                <div key={k}>
                  <label className="block text-xs font-medium mb-1">{l}</label>
                  <input type={t} required={l.includes("*")} value={(form as any)[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}
                    className="w-full px-3 py-2 border rounded-xl text-sm"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1">Role *</label>
                <select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm">
                  <option>Admin</option><option>TSA</option><option>CTV</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button type="button" onClick={()=>setShow(false)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-nn-700 text-white rounded-xl text-sm font-medium">Tạo</button>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}
