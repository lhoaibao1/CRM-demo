"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell, { authHeaders, useUser } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { STATUSES, WORKFLOW, NOTE_FORMS } from "@/lib/store";

type Lead = {
  id: string; hoTen: string; cccd: string; sdt: string; ngaySinh: string; noiCap: string;
  ngayCap: string; gioiTinh: string; tinhThanh: string; soTienYeuCau: number; ghiChuCTV: string;
  ctvId: string; tsaId: string | null; statusId: number; createdAt: string; updatedAt: string;
  history: { statusId: number; note: string; by: string; at: string }[];
  approval: {
    soTienDuyet: number; bhkv: string; thucNhan: number; laiSuat: number;
    thoiHan: number; ngayTra: number; traThang: number;
  } | null;
};

const money = (n: number) => n?.toLocaleString("vi-VN") + " đ";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const [lead, setLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<{ id: string; hoTen: string; role: string }[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [noteForm, setNoteForm] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [tsaId, setTsaId] = useState("");
  const [ap, setAp] = useState({ soTienDuyet: "", bhkv: "Có", thucNhan: "", laiSuat: "", thoiHan: "", ngayTra: "", traThang: "" });
  const [pending, setPending] = useState<{ statusId: number; note: string } | null>(null);

  async function load() {
    const [l, u] = await Promise.all([
      fetch(`/api/leads/${id}`, { headers: authHeaders() as HeadersInit }).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setLead(l);
    setUsers(u);
  }
  useEffect(() => { load(); }, [id]);

  const name = (uid: string | null) => users.find((u) => u.id === uid)?.hoTen || "—";
  const nextIds = lead ? WORKFLOW[lead.statusId] || [] : [];
  const canUpdate = user && (user.role === "Admin" || (user.role === "TSA" && lead?.tsaId === user.id)) && nextIds.length > 0;
  const canAssign = user?.role === "Admin" && lead && !lead.tsaId;

  async function confirmStatus() {
    if (!noteForm) { alert("Chọn ghi chú!"); return; }
    const note = noteForm === "CUSTOM" ? customNote : `${noteForm} – ${NOTE_FORMS[noteForm]}`;
    if (noteForm === "CUSTOM" && !customNote.trim()) { alert("Nhập ghi chú!"); return; }
    const sid = Number(newStatus);
    if (sid === 8) {
      setPending({ statusId: sid, note });
      setShowStatus(false);
      setShowApprove(true);
      return;
    }
    await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      headers: authHeaders() as HeadersInit,
      body: JSON.stringify({ statusId: sid, note }),
    });
    setShowStatus(false);
    load();
  }

  async function confirmApprove() {
    if (!pending) return;
    const approval = {
      soTienDuyet: +ap.soTienDuyet, bhkv: ap.bhkv, thucNhan: +ap.thucNhan,
      laiSuat: +ap.laiSuat, thoiHan: +ap.thoiHan, ngayTra: +ap.ngayTra, traThang: +ap.traThang,
    };
    if (!ap.soTienDuyet || !ap.thucNhan || !ap.laiSuat || !ap.thoiHan || !ap.ngayTra || !ap.traThang) {
      alert("Điền đủ thông tin phê duyệt!"); return;
    }
    await fetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      headers: authHeaders() as HeadersInit,
      body: JSON.stringify({ statusId: pending.statusId, note: pending.note, approval }),
    });
    setShowApprove(false);
    setPending(null);
    load();
  }

  async function confirmAssign() {
    await fetch(`/api/leads/${id}/assign`, {
      method: "PATCH",
      headers: authHeaders() as HeadersInit,
      body: JSON.stringify({ tsaId }),
    });
    setShowAssign(false);
    load();
  }

  if (!lead) return <Shell><div className="text-slate-400">Đang tải...</div></Shell>;

  return (
    <Shell>
      <button onClick={() => router.push("/leads")} className="text-sm text-slate-500 hover:text-brand mb-3">← Quay lại danh sách</button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lead.hoTen}</h1>
          <p className="text-sm text-slate-500 font-mono mt-0.5">{lead.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canUpdate && (
            <button onClick={() => { setNewStatus(String(nextIds[0])); setShowStatus(true); }}
              className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light">
              Cập nhật trạng thái
            </button>
          )}
          {canAssign && (
            <button onClick={() => setShowAssign(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-400">
              Gán TSA
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Thông tin Lead</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ["CCCD", lead.cccd], ["SĐT", lead.sdt], ["Ngày sinh", lead.ngaySinh],
              ["Nơi cấp", lead.noiCap], ["Ngày cấp", lead.ngayCap], ["Giới tính", lead.gioiTinh],
              ["Tỉnh thành", lead.tinhThanh], ["Số tiền yêu cầu", money(lead.soTienYeuCau)],
              ["CTV", name(lead.ctvId)], ["TSA", name(lead.tsaId)],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-slate-400 text-xs">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
            <div className="col-span-2"><dt className="text-slate-400 text-xs">Trạng thái</dt><dd className="mt-1"><StatusBadge statusId={lead.statusId} /></dd></div>
            {lead.ghiChuCTV && <div className="col-span-2"><dt className="text-slate-400 text-xs">Ghi chú CTV</dt><dd>{lead.ghiChuCTV}</dd></div>}
          </dl>
        </div>

        <div className="space-y-5">
          {lead.approval && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
              <h2 className="font-semibold text-emerald-800 mb-3">Thông tin phê duyệt</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Số tiền duyệt", money(lead.approval.soTienDuyet)],
                  ["BHKV", lead.approval.bhkv],
                  ["Thực nhận", money(lead.approval.thucNhan)],
                  ["Lãi suất", lead.approval.laiSuat + "%/năm"],
                  ["Thời hạn", lead.approval.thoiHan + " tháng"],
                  ["Ngày trả", "Ngày " + lead.approval.ngayTra],
                  ["Trả hàng tháng", money(lead.approval.traThang)],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-emerald-600/70 text-xs">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-semibold mb-3">Lịch sử trạng thái</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[...lead.history].reverse().map((h, i) => {
                const st = STATUSES.find((s) => s.id === h.statusId);
                return (
                  <div key={i} className="border-l-3 border-brand pl-3 py-1">
                    <div className="text-sm font-medium">{st?.name}</div>
                    <div className="text-xs text-slate-500">{h.note}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{h.by} · {new Date(h.at).toLocaleString("vi-VN")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status modal */}
      {showStatus && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-lg mb-4">Cập nhật trạng thái</h3>
            <label className="block text-sm font-medium mb-1">Trạng thái mới</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-3">
              {nextIds.map((nid) => {
                const s = STATUSES.find((x) => x.id === nid);
                return <option key={nid} value={nid}>{s?.name}</option>;
              })}
            </select>
            <label className="block text-sm font-medium mb-1">Ghi chú *</label>
            <select value={noteForm} onChange={(e) => setNoteForm(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-3">
              <option value="">-- Chọn form mẫu --</option>
              {Object.entries(NOTE_FORMS).map(([k, v]) => <option key={k} value={k}>{k} – {v}</option>)}
              <option value="CUSTOM">Ghi chú khác...</option>
            </select>
            {noteForm === "CUSTOM" && (
              <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm mb-3" placeholder="Nhập ghi chú..." />
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatus(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={confirmStatus} className="px-4 py-2 bg-brand text-white rounded-lg text-sm">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve modal */}
      {showApprove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="font-semibold text-lg mb-4">Thông tin phê duyệt</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["soTienDuyet", "Số tiền phê duyệt *", "number"],
                ["thucNhan", "Số tiền thực nhận *", "number"],
                ["laiSuat", "Lãi suất %/năm *", "number"],
                ["thoiHan", "Thời hạn (tháng) *", "number"],
                ["ngayTra", "Ngày trả hàng tháng *", "number"],
                ["traThang", "Số tiền trả tháng *", "number"],
              ].map(([k, label, type]) => (
                <div key={k}>
                  <label className="block text-xs font-medium mb-1">{label}</label>
                  <input type={type} value={(ap as any)[k]} onChange={(e) => setAp({ ...ap, [k]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1">BHKV *</label>
                <select value={ap.bhkv} onChange={(e) => setAp({ ...ap, bhkv: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option>Có</option><option>Không</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowApprove(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={confirmApprove} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Lưu & Phê duyệt</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-lg mb-4">Gán TSA</h3>
            <select value={tsaId} onChange={(e) => setTsaId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mb-4">
              <option value="">-- Chọn TSA --</option>
              {users.filter((u) => u.role === "TSA").map((u) => (
                <option key={u.id} value={u.id}>{u.hoTen}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={confirmAssign} disabled={!tsaId} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm disabled:opacity-50">Gán</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
