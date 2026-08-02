"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell, { authHeaders } from "@/components/Shell";

const fields = [
  { name: "hoTen", label: "Họ tên *", type: "text", required: true },
  { name: "cccd", label: "Số CCCD *", type: "text", required: true },
  { name: "sdt", label: "Số điện thoại *", type: "text", required: true },
  { name: "ngaySinh", label: "Ngày sinh *", type: "date", required: true },
  { name: "noiCap", label: "Nơi cấp *", type: "text", required: true },
  { name: "ngayCap", label: "Ngày cấp *", type: "date", required: true },
  { name: "tinhThanh", label: "Tỉnh thành *", type: "text", required: true },
  { name: "soTienYeuCau", label: "Số tiền yêu cầu *", type: "number", required: true },
];

export default function ImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ gioiTinh: "", ghiChuCTV: "" });

  function set(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: authHeaders() as HeadersInit,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi");
      alert("Tạo Lead thành công: " + data.id);
      router.push("/leads/" + data.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Import Lead</h1>
      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-600 mb-1">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.name] || ""}
                onChange={(e) => set(f.name, e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Giới tính *</label>
            <select
              required
              value={form.gioiTinh}
              onChange={(e) => set("gioiTinh", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">-- Chọn --</option>
              <option>Nam</option>
              <option>Nữ</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Ghi chú sơ bộ</label>
            <textarea
              rows={2}
              value={form.ghiChuCTV}
              onChange={(e) => set("ghiChuCTV", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light disabled:opacity-60"
          >
            {loading ? "Đang tạo..." : "Tạo Lead"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            Hủy
          </button>
        </div>
      </form>
    </Shell>
  );
}
