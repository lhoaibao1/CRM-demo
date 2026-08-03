export type Role = "Admin" | "TSA" | "CTV";
export type User = {
  id: string; username: string; password: string;
  hoTen: string; role: Role; sdt: string; cccd: string; active: boolean;
};
export type Approval = {
  soTienDuyet: number; bhkv: string; thucNhan: number;
  laiSuat: number; thoiHan: number; ngayTra: number; traThang: number;
  sanPham: string; idRlos: string;
};
export type Product = { id: string; name: string; laiSuat: number; active: boolean };
export type HistoryItem = { statusId: number; note: string; by: string; at: string };
export type Lead = {
  id: string; hoTen: string; cccd: string; sdt: string; ngaySinh: string;
  noiCap: string; ngayCap: string; gioiTinh: string; tinhThanh: string;
  soTienYeuCau: number; ghiChuCTV: string; ctvId: string; tsaId: string | null;
  statusId: number; createdAt: string; updatedAt: string;
  history: HistoryItem[]; approval: Approval | null;
};
export type Notification = {
  id: string; userId: string; title: string; body: string;
  leadId?: string; read: boolean; createdAt: string;
};
export type NoteForm = { code: string; content: string };

export const STATUSES = [
  { id: 1, name: "Chờ Check Dup", step: "Start", color: "amber", order: 1 },
  { id: 2, name: "Nợ xấu/Chú ý", step: "No Pass", color: "rose", order: 0 },
  { id: 3, name: "Reject <90 ngày", step: "No Pass", color: "rose", order: 0 },
  { id: 4, name: "Đang gọi tư vấn", step: "Pass", color: "sky", order: 2 },
  { id: 5, name: "KH bổ sung hồ sơ", step: "Pass", color: "sky", order: 3 },
  { id: 6, name: "Đang thẩm định", step: "Pass", color: "indigo", order: 4 },
  { id: 7, name: "Thẩm định từ chối", step: "Close", color: "rose", order: 0 },
  { id: 8, name: "Đã phê duyệt", step: "Pass", color: "emerald", order: 5 },
  { id: 9, name: "Hồ sơ END", step: "Close", color: "slate", order: 6 },
  { id: 10, name: "Trả về Sale", step: "Return", color: "orange", order: 0 },
] as const;

/** Main happy-path steps for visual workflow */
export const PIPELINE = [
  { id: 1, label: "Check Dup" },
  { id: 4, label: "Gọi tư vấn" },
  { id: 5, label: "Bổ sung HS" },
  { id: 6, label: "Thẩm định" },
  { id: 8, label: "Phê duyệt" },
  { id: 9, label: "END" },
];

export const WORKFLOW: Record<number, number[]> = {
  1: [2, 3, 4], 2: [], 3: [], 4: [5, 10], 5: [6], 6: [7, 8, 10], 7: [], 8: [9], 9: [], 10: [],
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", name: "Easy Cash 32", laiSuat: 32, active: true },
  { id: "p2", name: "Easy Cash 37", laiSuat: 37, active: true },
  { id: "p3", name: "Cashloan Civil Tight", laiSuat: 29, active: true },
  { id: "p4", name: "Cashloan Civil Easy", laiSuat: 35, active: true },
  { id: "p5", name: "Cashloan Life Insurance Flex", laiSuat: 35, active: true },
  { id: "p6", name: "Cashloan Life Insurance Secure", laiSuat: 29, active: true },
];

const DEFAULT_NOTES: NoteForm[] = [
  { code: "D01", content: "Khách hàng không nghe máy" },
  { code: "D02", content: "Thuê bao" },
  { code: "R01", content: "KH bị rj <90 ngày" },
  { code: "R02", content: "KH nợ xấu/chú ý" },
  { code: "R03", content: "KH bị từ chối" },
  { code: "UW01", content: "Hồ sơ đang thẩm định" },
  { code: "UW02", content: "Hồ sơ được duyệt" },
];

const USERS: User[] = [
  { id: "u1", username: "admin", password: "admin123", hoTen: "Nguyễn Văn Admin", role: "Admin", sdt: "0901000001", cccd: "001000000001", active: true },
  { id: "u2", username: "tsa1", password: "tsa123", hoTen: "Trần Thị TSA", role: "TSA", sdt: "0902000001", cccd: "001000000002", active: true },
  { id: "u3", username: "tsa2", password: "tsa123", hoTen: "Lê Văn TSA", role: "TSA", sdt: "0902000002", cccd: "001000000003", active: true },
  { id: "u4", username: "ctv1", password: "ctv123", hoTen: "Phạm CTV Một", role: "CTV", sdt: "0903000001", cccd: "001000000004", active: true },
  { id: "u5", username: "ctv2", password: "ctv123", hoTen: "Hoàng CTV Hai", role: "CTV", sdt: "0903000002", cccd: "001000000005", active: true },
];

function seedLeads(): Lead[] {
  const now = new Date().toISOString();
  return [
    {
      id: "LD-20260801-001", hoTen: "Trần Thị Bích", cccd: "001234567890", sdt: "0901234567",
      ngaySinh: "1990-05-15", noiCap: "CA TP.HCM", ngayCap: "2020-01-10", gioiTinh: "Nữ",
      tinhThanh: "TP. Hồ Chí Minh", soTienYeuCau: 50000000, ghiChuCTV: "Vay tiêu dùng",
      ctvId: "u4", tsaId: "u2", statusId: 8, createdAt: now, updatedAt: now,
      history: [
        { statusId: 1, note: "Import lead", by: "Phạm CTV Một", at: now },
        { statusId: 4, note: "Pass Check Dup", by: "Trần Thị TSA", at: now },
        { statusId: 6, note: "UW01 – Hồ sơ đang thẩm định", by: "Trần Thị TSA", at: now },
        { statusId: 8, note: "UW02 – Hồ sơ được duyệt", by: "Trần Thị TSA", at: now },
      ],
      approval: { soTienDuyet: 50000000, bhkv: "Có", thucNhan: 48000000, laiSuat: 32, thoiHan: 12, ngayTra: 5, traThang: 4500000, sanPham: "Easy Cash 32", idRlos: "RLOS-2026-001" },
    },
    {
      id: "LD-20260801-002", hoTen: "Lê Hoàng Nam", cccd: "001987654321", sdt: "0912345678",
      ngaySinh: "1988-03-20", noiCap: "CA Hà Nội", ngayCap: "2019-06-01", gioiTinh: "Nam",
      tinhThanh: "Hà Nội", soTienYeuCau: 30000000, ghiChuCTV: "",
      ctvId: "u4", tsaId: null, statusId: 2, createdAt: now, updatedAt: now,
      history: [
        { statusId: 1, note: "Import lead", by: "Phạm CTV Một", at: now },
        { statusId: 2, note: "R02 – KH nợ xấu/chú ý", by: "Nguyễn Văn Admin", at: now },
      ],
      approval: null,
    },
    {
      id: "LD-20260801-003", hoTen: "Hoàng Minh Tuấn", cccd: "079123456789", sdt: "0987654321",
      ngaySinh: "1995-11-08", noiCap: "CA Đồng Nai", ngayCap: "2021-03-15", gioiTinh: "Nam",
      tinhThanh: "Đồng Nai", soTienYeuCau: 40000000, ghiChuCTV: "Vay mua xe",
      ctvId: "u5", tsaId: "u3", statusId: 6, createdAt: now, updatedAt: now,
      history: [
        { statusId: 1, note: "Import lead", by: "Hoàng CTV Hai", at: now },
        { statusId: 4, note: "Pass Check Dup", by: "Lê Văn TSA", at: now },
        { statusId: 6, note: "UW01 – Hồ sơ đang thẩm định", by: "Lê Văn TSA", at: now },
      ],
      approval: null,
    },
  ];
}

type Store = { users: User[]; leads: Lead[]; notes: NoteForm[]; notifications: Notification[]; products: Product[] };
const g = globalThis as unknown as { __nnf2?: Store };
if (!g.__nnf2) {
  g.__nnf2 = { users: USERS, leads: seedLeads(), notes: [...DEFAULT_NOTES], notifications: [], products: [...DEFAULT_PRODUCTS] };
}

function uid() { return "n" + Date.now() + Math.random().toString(36).slice(2, 7); }

export const db = {
  users: () => g.__nnf2!.users,
  user: (id: string) => g.__nnf2!.users.find((u) => u.id === id),
  byLogin: (username: string, password: string) =>
    g.__nnf2!.users.find((u) => u.username === username && u.password === password && u.active),
  leads: () => g.__nnf2!.leads,
  lead: (id: string) => g.__nnf2!.leads.find((l) => l.id === id),
  addLead: (lead: Lead) => { g.__nnf2!.leads.push(lead); return lead; },
  updateLead: (id: string, patch: Partial<Lead>) => {
    const i = g.__nnf2!.leads.findIndex((l) => l.id === id);
    if (i < 0) return null;
    g.__nnf2!.leads[i] = { ...g.__nnf2!.leads[i], ...patch };
    return g.__nnf2!.leads[i];
  },
  updateUser: (id: string, patch: Partial<User>) => {
    const i = g.__nnf2!.users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    g.__nnf2!.users[i] = { ...g.__nnf2!.users[i], ...patch };
    return g.__nnf2!.users[i];
  },
  addUser: (u: User) => { g.__nnf2!.users.push(u); return u; },
  filterLeads: (user: User) => {
    const all = g.__nnf2!.leads;
    if (user.role === "CTV") return all.filter((l) => l.ctvId === user.id);
    if (user.role === "TSA") return all.filter((l) => l.tsaId === user.id);
    return all;
  },
  notes: () => g.__nnf2!.notes,
  addNote: (n: NoteForm) => { g.__nnf2!.notes.push(n); return n; },
  removeNote: (code: string) => { g.__nnf2!.notes = g.__nnf2!.notes.filter((n) => n.code !== code); },
  updateNote: (code: string, content: string) => {
    const n = g.__nnf2!.notes.find((x) => x.code === code);
    if (n) n.content = content;
    return n;
  },
  notify: (userId: string, title: string, body: string, leadId?: string) => {
    const n: Notification = { id: uid(), userId, title, body, leadId, read: false, createdAt: new Date().toISOString() };
    g.__nnf2!.notifications.unshift(n);
    return n;
  },
  notifications: (userId: string) => g.__nnf2!.notifications.filter((n) => n.userId === userId),
  markRead: (userId: string, id?: string) => {
    g.__nnf2!.notifications.forEach((n) => {
      if (n.userId === userId && (!id || n.id === id)) n.read = true;
    });
  },
  unreadCount: (userId: string) => g.__nnf2!.notifications.filter((n) => n.userId === userId && !n.read).length,
  products: () => g.__nnf2!.products,
  addProduct: (p: Product) => { g.__nnf2!.products.push(p); return p; },
  updateProduct: (id: string, patch: Partial<Product>) => {
    const i = g.__nnf2!.products.findIndex((x) => x.id === id);
    if (i < 0) return null;
    g.__nnf2!.products[i] = { ...g.__nnf2!.products[i], ...patch };
    return g.__nnf2!.products[i];
  },
  removeProduct: (id: string) => { g.__nnf2!.products = g.__nnf2!.products.filter((p) => p.id !== id); },
};

