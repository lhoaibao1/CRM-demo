export type Role = "Admin" | "TSA" | "CTV";
export type User = {
  id: string; username: string; password: string;
  hoTen: string; role: Role; sdt: string; cccd: string; active: boolean;
};
export type Approval = {
  soTienDuyet: number; bhkv: string; thucNhan: number;
  laiSuat: number; thoiHan: number; ngayTra: number; traThang: number;
};
export type HistoryItem = { statusId: number; note: string; by: string; at: string };
export type Lead = {
  id: string; hoTen: string; cccd: string; sdt: string; ngaySinh: string;
  noiCap: string; ngayCap: string; gioiTinh: string; tinhThanh: string;
  soTienYeuCau: number; ghiChuCTV: string; ctvId: string; tsaId: string | null;
  statusId: number; createdAt: string; updatedAt: string;
  history: HistoryItem[]; approval: Approval | null;
};

export const STATUSES = [
  { id: 1, name: "Chờ Check Dup", color: "amber" },
  { id: 2, name: "Nợ xấu/Chú ý", color: "rose" },
  { id: 3, name: "Reject <90 ngày", color: "rose" },
  { id: 4, name: "Đang gọi tư vấn", color: "sky" },
  { id: 5, name: "KH bổ sung hồ sơ", color: "sky" },
  { id: 6, name: "Đang thẩm định", color: "indigo" },
  { id: 7, name: "Thẩm định từ chối", color: "rose" },
  { id: 8, name: "Đã phê duyệt", color: "emerald" },
  { id: 9, name: "Hồ sơ END", color: "slate" },
  { id: 10, name: "Trả về Sale", color: "orange" },
] as const;

export const WORKFLOW: Record<number, number[]> = {
  1: [2, 3, 4], 2: [], 3: [], 4: [5, 10], 5: [6], 6: [7, 8, 10], 7: [], 8: [9], 9: [], 10: [],
};

export const NOTE_FORMS: Record<string, string> = {
  D01: "Khách hàng không nghe máy", D02: "Thuê bao",
  R01: "KH bị rj <90 ngày", R02: "KH nợ xấu/chú ý", R03: "KH bị từ chối",
  UW01: "Hồ sơ đang thẩm định", UW02: "Hồ sơ được duyệt",
};

const USERS: User[] = [
  { id: "u1", username: "admin", password: "admin123", hoTen: "Nguyễn Văn Admin", role: "Admin", sdt: "0901000001", cccd: "001000000001", active: true },
  { id: "u2", username: "tsa1", password: "tsa123", hoTen: "Trần Thị TSA", role: "TSA", sdt: "0902000001", cccd: "001000000002", active: true },
  { id: "u3", username: "tsa2", password: "tsa123", hoTen: "Lê Văn TSA", role: "TSA", sdt: "0902000002", cccd: "001000000003", active: true },
  { id: "u4", username: "ctv1", password: "ctv123", hoTen: "Phạm CTV Một", role: "CTV", sdt: "0903000001", cccd: "001000000004", active: true },
  { id: "u5", username: "ctv2", password: "ctv123", hoTen: "Hoàng CTV Hai", role: "CTV", sdt: "0903000002", cccd: "001000000005", active: true },
];

function seed(): Lead[] {
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
      approval: { soTienDuyet: 50000000, bhkv: "Có", thucNhan: 48000000, laiSuat: 18, thoiHan: 12, ngayTra: 5, traThang: 4500000 },
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

const g = globalThis as unknown as { __nnf?: { users: User[]; leads: Lead[] } };
if (!g.__nnf) g.__nnf = { users: USERS, leads: seed() };

export const db = {
  users: () => g.__nnf!.users,
  user: (id: string) => g.__nnf!.users.find((u) => u.id === id),
  byLogin: (username: string, password: string) =>
    g.__nnf!.users.find((u) => u.username === username && u.password === password && u.active),
  leads: () => g.__nnf!.leads,
  lead: (id: string) => g.__nnf!.leads.find((l) => l.id === id),
  addLead: (lead: Lead) => { g.__nnf!.leads.push(lead); return lead; },
  updateLead: (id: string, patch: Partial<Lead>) => {
    const i = g.__nnf!.leads.findIndex((l) => l.id === id);
    if (i < 0) return null;
    g.__nnf!.leads[i] = { ...g.__nnf!.leads[i], ...patch };
    return g.__nnf!.leads[i];
  },
  updateUser: (id: string, patch: Partial<User>) => {
    const i = g.__nnf!.users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    g.__nnf!.users[i] = { ...g.__nnf!.users[i], ...patch };
    return g.__nnf!.users[i];
  },
  addUser: (u: User) => { g.__nnf!.users.push(u); return u; },
  filterLeads: (user: User) => {
    const all = g.__nnf!.leads;
    if (user.role === "CTV") return all.filter((l) => l.ctvId === user.id);
    if (user.role === "TSA") return all.filter((l) => l.tsaId === user.id);
    return all;
  },
};
