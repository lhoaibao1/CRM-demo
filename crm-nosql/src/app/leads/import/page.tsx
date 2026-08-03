"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell, { authHeaders } from "@/components/Shell";
import { Save, ArrowLeft } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ gioiTinh: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/leads/" + data.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Lỗi");
    } finally { setLoading(false); }
  }

  const fields: [string, string, string, boolean][] = [
    ["hoTen", "Họ tên *", "text", true],
    ["cccd", "Số CCCD *", "text", true],
    ["sdt", "Số điện thoại *", "text", true],
    ["ngaySinh", "Ngày sinh *", "date", true],
    ["noiCap", "Nơi cấp *", "text", true],
    ["ngayCap", "Ngày cấp *", "date", true],
    ["tinhThanh", "Tỉnh thành *", "text", true],
    ["soTienYeuCau", "Số tiền yêu cầu *", "number", true],
    ["idRlos", "ID RLOS (có thể bỏ trống)", "text", false],
  ];

  return (
    <Shell>
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-nn-600 mb-4">
        <ArrowLeft size={14} /> Quay lại
      </button>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Import Lead mới</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map(([name, label, type, req]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
              <input type={type} required={req} value={form[name] || ""} onChange={(e) => set(name, e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-nn-500 focus:ring-4 focus:ring-nn-500/10" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Giới tính *</label>
            <select required value={form.gioiTinh} onChange={(e) => set("gioiTinh", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm">
              <option value="">-- Chọn --</option>
              <option>Nam</option><option>Nữ</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Ghi chú sơ bộ</label>
            <textarea rows={2} value={form.ghiChuCTV || ""} onChange={(e) => set("ghiChuCTV", e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft disabled:opacity-60">
            <Save size={16} /> {loading ? "Đang tạo..." : "Tạo Lead"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
        </div>
      </form>
    </Shell>
  );
}
