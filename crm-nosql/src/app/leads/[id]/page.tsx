"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell, { authHeaders, useUser } from "@/components/Shell";
import StatusBadge from "@/components/StatusBadge";
import { STATUSES, WORKFLOW } from "@/lib/store";
import { ArrowLeft, RefreshCw, UserPlus, Pencil } from "lucide-react";
import WorkflowBar from "@/components/WorkflowBar";

type Lead = any;

function formatMoney(n: number | string) {
  const num = typeof n === "string" ? Number(n.replace(/\D/g, "")) : n;
  if (num == null || isNaN(num)) return "—";
  return num.toLocaleString("vi-VN") + " đ";
}

/** Format input while typing: 50000000 → 50.000.000 */
function fmtInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}
function parseMoney(s: string) {
  return Number(String(s).replace(/\D/g, "")) || 0;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const [lead, setLead] = useState<Lead>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [notes, setNotes] = useState<{ code: string; content: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; laiSuat: number }[]>([]);
  const [modal, setModal] = useState<"status" | "approve" | "assign" | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [noteForm, setNoteForm] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [tsaId, setTsaId] = useState("");
  const [ap, setAp] = useState({
    soTienDuyet: "", thucNhan: "", traThang: "",
    bhkv: "Có", laiSuat: "", thoiHan: "", ngayTra: "",
    sanPham: "", idRlos: "", soHopDong: "",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<{ statusId: number; note: string } | null>(null);

  async function load() {
    const [l, u, n, p] = await Promise.all([
      fetch(`/api/leads/${id}`, { headers: authHeaders() }).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]);
    setLead(l); setUsers(u); setNotes(n); setProducts(p);
  }
  useEffect(() => { load(); }, [id]);

  const name = (uid: string | null) => users.find((u) => u.id === uid)?.hoTen || "—";
  const nextIds = lead ? (WORKFLOW[lead.statusId] || []) : [];
  const canUpdate = user && (user.role === "Admin" || (user.role === "TSA" && lead?.tsaId === user.id)) && nextIds.length > 0;
  // Admin gán TSA bất kỳ Lead nào
  const canAssign = user?.role === "Admin" && lead;
  const canEdit = user?.role === "Admin" && lead;

  function pickProduct(name: string) {
    const p = products.find((x) => x.name === name);
    setAp((a) => ({ ...a, sanPham: name, laiSuat: p ? String(p.laiSuat) : a.laiSuat }));
  }

  async function doStatus() {
    if (!noteForm) { alert("Chọn ghi chú"); return; }
    const nf = notes.find((x) => x.code === noteForm);
    const note = noteForm === "CUSTOM" ? customNote : `${noteForm} – ${nf?.content || noteForm}`;
    if (noteForm === "CUSTOM" && !customNote.trim()) { alert("Nhập ghi chú"); return; }
    const sid = Number(newStatus);
    if (sid === 8) {
      setPending({ statusId: sid, note });
      setModal("approve");
      return;
    }
    await fetch(`/api/leads/${id}/status`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ statusId: sid, note }),
    });
    setModal(null); load();
  }

  async function doApprove() {
    if (!pending) return;
    if (!ap.sanPham || !ap.soTienDuyet || !ap.thucNhan || !ap.laiSuat || !ap.thoiHan || !ap.ngayTra || !ap.traThang) {
      alert("Điền đủ: Sản phẩm, số tiền, lãi suất, kỳ hạn..."); return;
    }
    const approval = {
      soTienDuyet: parseMoney(ap.soTienDuyet),
      thucNhan: parseMoney(ap.thucNhan),
      traThang: parseMoney(ap.traThang),
      bhkv: ap.bhkv,
      laiSuat: Number(ap.laiSuat),
      thoiHan: Number(ap.thoiHan),
      ngayTra: Number(ap.ngayTra),
      sanPham: ap.sanPham,
      idRlos: ap.idRlos,
      soHopDong: ap.soHopDong || "",
    };
    await fetch(`/api/leads/${id}/status`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ statusId: pending.statusId, note: pending.note, approval }),
    });
    if (ap.idRlos) {
      await fetch(`/api/leads/${id}`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ idRlos: ap.idRlos }),
      });
    }
    setModal(null); setPending(null); load();
  }

  async function doAssign() {
    if (!tsaId) { alert("Chọn TSA"); return; }
    await fetch(`/api/leads/${id}/assign`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ tsaId }),
    });
    setModal(null); load();
  }

  if (!lead) return (
    <Shell>
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-nn-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Shell>
  );

  return (
    <Shell>
      <button onClick={() => router.push("/leads")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-nn-600 mb-4">
        <ArrowLeft size={14} /> Danh sách Lead
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nn-600 to-nn-800 flex items-center justify-center text-white text-xl font-bold shadow-glow">
            {lead.hoTen.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.hoTen}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{lead.id}</span>
              <StatusBadge statusId={lead.statusId} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canUpdate && (
            <button onClick={() => { setNewStatus(String(nextIds[0])); setNoteForm(""); setModal("status"); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-nn-700 hover:bg-nn-600 text-white rounded-xl text-sm font-medium shadow-soft">
              <RefreshCw size={15} /> Cập nhật trạng thái
            </button>
          )}
          {canAssign && (
            <button onClick={() => { setTsaId(lead.tsaId || ""); setModal("assign"); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-medium">
              <UserPlus size={15} /> {lead.tsaId ? "Đổi TSA" : "Gán TSA"}
            </button>
          )}
          {canEdit && (
            <button onClick={() => {
              setEditForm({
                hoTen: lead.hoTen, cccd: lead.cccd, sdt: lead.sdt, ngaySinh: lead.ngaySinh,
                noiCap: lead.noiCap, ngayCap: lead.ngayCap, gioiTinh: lead.gioiTinh,
                tinhThanh: lead.tinhThanh, soTienYeuCau: String(lead.soTienYeuCau),
                idRlos: lead.idRlos || "", ghiChuCTV: lead.ghiChuCTV || "",
              });
              setEditOpen(true);
            }}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium">
              <Pencil size={15} /> Sửa thông tin
            </button>
          )}
        </div>
      </div>

      <WorkflowBar statusId={lead.statusId} />

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Thông tin khách hàng</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ["CCCD", lead.cccd], ["SĐT", lead.sdt], ["Ngày sinh", lead.ngaySinh], ["Giới tính", lead.gioiTinh],
                ["Nơi cấp", lead.noiCap], ["Ngày cấp", lead.ngayCap], ["Tỉnh thành", lead.tinhThanh],
                ["Số tiền yêu cầu", formatMoney(lead.soTienYeuCau)], ["ID RLOS", lead.idRlos || "—"], ["CTV", name(lead.ctvId)], ["TSA", name(lead.tsaId)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <span className="text-xs text-slate-400 mb-0.5">{k}</span>
                  <span className="font-medium text-slate-800">{v}</span>
                </div>
              ))}
              {lead.ghiChuCTV && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-400">Ghi chú CTV</span>
                  <p className="font-medium text-slate-700 mt-0.5">{lead.ghiChuCTV}</p>
                </div>
              )}
            </div>
          </div>

          {lead.approval && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
              <h2 className="font-semibold text-emerald-800 mb-4">Thông tin phê duyệt</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  ["Sản phẩm", lead.approval.sanPham || "—"],
                  ["Số hợp đồng", lead.approval.soHopDong || "—"],
                  ["ID RLOS", lead.approval.idRlos || "—"],
                  ["Số tiền duyệt", formatMoney(lead.approval.soTienDuyet)],
                  ["BHKV", lead.approval.bhkv],
                  ["Thực nhận", formatMoney(lead.approval.thucNhan)],
                  ["Lãi suất", lead.approval.laiSuat + "%/năm"],
                  ["Thời hạn", lead.approval.thoiHan + " tháng"],
                  ["Ngày trả", "Ngày " + lead.approval.ngayTra],
                  ["Trả hàng tháng", formatMoney(lead.approval.traThang)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span className="text-xs text-emerald-600/70">{k}</span>
                    <div className="font-semibold text-emerald-900">{v}</div>
                  </div>
                ))}
              </div>
              {lead.statusId === 8 && canUpdate && (
                <p className="mt-4 text-xs text-emerald-700 bg-white/60 rounded-lg px-3 py-2">
                  Hồ sơ đã phê duyệt — bấm <b>Cập nhật trạng thái</b> để chuyển <b>Hồ sơ END</b>.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 sticky top-6">
            <h2 className="font-semibold text-slate-800 mb-4">Lịch sử</h2>
            <div className="space-y-0">
              {[...lead.history].reverse().map((h: any, i: number) => {
                const st = STATUSES.find((s) => s.id === h.statusId);
                return (
                  <div key={i} className="relative pl-6 pb-5 last:pb-0">
                    <div className="absolute left-1.5 top-1.5 bottom-0 w-px bg-slate-200" />
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-nn-600 ring-4 ring-nn-100" />
                    <div className="text-sm font-medium text-slate-800">{st?.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{h.note}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{h.by} · {new Date(h.at).toLocaleString("vi-VN")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status modal */}
      {modal === "status" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
            <h3 className="font-bold text-lg mb-4">Cập nhật trạng thái</h3>
            <label className="block text-sm font-medium mb-1.5">Trạng thái mới</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm mb-3">
              {nextIds.map((nid: number) => {
                const s = STATUSES.find((x) => x.id === nid);
                return <option key={nid} value={nid}>{s?.name}</option>;
              })}
            </select>
            <label className="block text-sm font-medium mb-1.5">Ghi chú *</label>
            <select value={noteForm} onChange={(e) => setNoteForm(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm mb-3">
              <option value="">-- Chọn form --</option>
              {notes.map((n) => <option key={n.code} value={n.code}>{n.code} – {n.content}</option>)}
              <option value="CUSTOM">Ghi chú khác...</option>
            </select>
            {noteForm === "CUSTOM" && (
              <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)} rows={2}
                className="w-full px-3 py-2 border rounded-xl text-sm mb-3" placeholder="Nhập ghi chú..." />
            )}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button onClick={doStatus} className="px-4 py-2 bg-nn-700 text-white rounded-xl text-sm font-medium">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve modal */}
      {modal === "approve" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Thông tin phê duyệt</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Sản phẩm *</label>
                <select value={ap.sanPham} onChange={(e) => pickProduct(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name} ({p.laiSuat}%/năm)</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">ID RLOS (tuỳ chọn)</label>
                <input value={ap.idRlos} onChange={(e) => setAp({ ...ap, idRlos: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono" placeholder="RLOS-xxxx" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Số hợp đồng (tuỳ chọn)</label>
                <input value={ap.soHopDong} onChange={(e) => setAp({ ...ap, soHopDong: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono" placeholder="HD-xxxx" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Số tiền duyệt *</label>
                <input value={ap.soTienDuyet}
                  onChange={(e) => setAp({ ...ap, soTienDuyet: fmtInput(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="50.000.000" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Thực nhận *</label>
                <input value={ap.thucNhan}
                  onChange={(e) => setAp({ ...ap, thucNhan: fmtInput(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="48.000.000" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Lãi suất %/năm *</label>
                <input type="number" value={ap.laiSuat} readOnly
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-50" placeholder="Chọn SP → tự điền" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Thời hạn (tháng) *</label>
                <input type="number" value={ap.thoiHan} onChange={(e) => setAp({ ...ap, thoiHan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Ngày trả hàng tháng *</label>
                <input type="number" min={1} max={28} value={ap.ngayTra} onChange={(e) => setAp({ ...ap, ngayTra: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Trả hàng tháng *</label>
                <input value={ap.traThang}
                  onChange={(e) => setAp({ ...ap, traThang: fmtInput(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="4.500.000" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">BHKV *</label>
                <select value={ap.bhkv} onChange={(e) => setAp({ ...ap, bhkv: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm">
                  <option>Có</option><option>Không</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button onClick={doApprove} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium">Lưu & Duyệt</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {modal === "assign" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            <h3 className="font-bold text-lg mb-4">{lead.tsaId ? "Đổi TSA" : "Gán TSA"}</h3>
            <select value={tsaId} onChange={(e) => setTsaId(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm mb-4">
              <option value="">-- Chọn TSA --</option>
              {users.filter((u: any) => u.role === "TSA").map((u: any) => (
                <option key={u.id} value={u.id}>{u.hoTen}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button onClick={doAssign} disabled={!tsaId} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">Gán</button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={async (e) => {
            e.preventDefault();
            await fetch(`/api/leads/${id}`, {
              method: "PATCH", headers: authHeaders(),
              body: JSON.stringify({ ...editForm, soTienYeuCau: Number(String(editForm.soTienYeuCau).replace(/\D/g, "")) }),
            });
            setEditOpen(false); load();
          }} className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Sửa thông tin Lead</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["hoTen","Họ tên"],["cccd","CCCD"],["sdt","SĐT"],["ngaySinh","Ngày sinh"],
                ["noiCap","Nơi cấp"],["ngayCap","Ngày cấp"],["tinhThanh","Tỉnh thành"],
                ["soTienYeuCau","Số tiền YC"],["idRlos","ID RLOS"],
              ].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs font-medium mb-1">{l}</label>
                  <input value={editForm[k]||""} onChange={(e)=>setEditForm({...editForm,[k]:e.target.value})}
                    className="w-full px-3 py-2 border rounded-xl text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1">Giới tính</label>
                <select value={editForm.gioiTinh||""} onChange={(e)=>setEditForm({...editForm,gioiTinh:e.target.value})}
                  className="w-full px-3 py-2 border rounded-xl text-sm">
                  <option>Nam</option><option>Nữ</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Ghi chú CTV</label>
                <textarea value={editForm.ghiChuCTV||""} onChange={(e)=>setEditForm({...editForm,ghiChuCTV:e.target.value})}
                  rows={2} className="w-full px-3 py-2 border rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={()=>setEditOpen(false)} className="px-4 py-2 border rounded-xl text-sm">Hủy</button>
              <button type="submit" className="px-4 py-2 bg-nn-700 text-white rounded-xl text-sm font-medium">Lưu</button>
            </div>
          </form>
        </div>
      )}
    </Shell>
  );
}

