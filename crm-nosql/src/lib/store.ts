export type Role = "Admin" | "TSA" | "CTV";

export type User = {
  id: string;
  hoTen: string;
  role: Role;
  sdt: string;
  cccd: string;
};

export type Approval = {
  soTienDuyet: number;
  bhkv: string;
  thucNhan: number;
  laiSuat: number;
  thoiHan: number;
  ngayTra: number;
  traThang: number;
};

export type HistoryItem = {
  statusId: number;
  note: string;
  by: string;
  at: string;
};

export type Lead = {
  id: string;
  hoTen: string;
  cccd: string;
  sdt: string;
  ngaySinh: string;
  noiCap: string;
  ngayCap: string;
  gioiTinh: string;
  tinhThanh: string;
  soTienYeuCau: number;
  ghiChuCTV: string;
  ctvId: string;
  tsaId: string | null;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  history: HistoryItem[];
  approval: Approval | null;
};

export const STATUSES = [
  { id: 1, name: "Chờ Check Dup thông tin sơ bộ", color: "yellow" },
  { id: 2, name: "Nợ xấu/Chú ý", color: "red" },
  { id: 3, name: "Hồ sơ Reject <90 ngày", color: "red" },
  { id: 4, name: "TSA đang thực hiện cuộc gọi tư vấn", color: "blue" },
  { id: 5, name: "Khách hàng bổ sung hồ sơ vay", color: "blue" },
  { id: 6, name: "Đang thẩm định", color: "blue" },
  { id: 7, name: "Thẩm định từ chối", color: "red" },
  { id: 8, name: "Đã phê duyệt", color: "green" },
  { id: 9, name: "Hồ sơ END", color: "gray" },
  { id: 10, name: "Trả về Sale", color: "orange" },
] as const;

export const WORKFLOW: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [],
  3: [],
  4: [5, 10],
  5: [6],
  6: [7, 8, 10],
  7: [],
  8: [9],
  9: [],
  10: [],
};

export const NOTE_FORMS: Record<string, string> = {
  D01: "Khách hàng không nghe máy",
  D02: "Thuê bao",
  R01: "KH bị rj <90 ngày",
  R02: "KH nợ xấu/chú ý",
  R03: "KH bị từ chối",
  UW01: "Hồ sơ đang thẩm định",
  UW02: "Hồ sơ được duyệt",
};

const USERS: User[] = [
  { id: "u1", hoTen: "Nguyễn Admin", role: "Admin", sdt: "0901000001", cccd: "001000000001" },
  { id: "u2", hoTen: "Trần TSA 1", role: "TSA", sdt: "0902000001", cccd: "001000000002" },
  { id: "u3", hoTen: "Lê TSA 2", role: "TSA", sdt: "0902000002", cccd: "001000000003" },
  { id: "u4", hoTen: "Phạm CTV 1", role: "CTV", sdt: "0903000001", cccd: "001000000004" },
  { id: "u5", hoTen: "Hoàng CTV 2", role: "CTV", sdt: "0903000002", cccd: "001000000005" },
];

function seedLeads(): Lead[] {
  const now = new Date().toISOString();
  return [
    {
      id: "LD-20260801-001",
      hoTen: "Trần Thị Bích",
      cccd: "001234567890",
      sdt: "0901234567",
      ngaySinh: "1990-05-15",
      noiCap: "CA TP.HCM",
      ngayCap: "2020-01-10",
      gioiTinh: "Nữ",
      tinhThanh: "TP. Hồ Chí Minh",
      soTienYeuCau: 50000000,
      ghiChuCTV: "Cần vay tiêu dùng",
      ctvId: "u4",
      tsaId: "u2",
      statusId: 8,
      createdAt: now,
      updatedAt: now,
      history: [
        { statusId: 1, note: "Import lead", by: "Phạm CTV 1", at: now },
        { statusId: 4, note: "Pass Check Dup", by: "Trần TSA 1", at: now },
        { statusId: 5, note: "KH đã gửi giấy tờ", by: "Trần TSA 1", at: now },
        { statusId: 6, note: "UW01 – Hồ sơ đang thẩm định", by: "Trần TSA 1", at: now },
        { statusId: 8, note: "UW02 – Hồ sơ được duyệt", by: "Trần TSA 1", at: now },
      ],
      approval: {
        soTienDuyet: 50000000,
        bhkv: "Có",
        thucNhan: 48000000,
        laiSuat: 18,
        thoiHan: 12,
        ngayTra: 5,
        traThang: 4500000,
      },
    },
    {
      id: "LD-20260801-002",
      hoTen: "Lê Hoàng Nam",
      cccd: "001987654321",
      sdt: "0912345678",
      ngaySinh: "1988-03-20",
      noiCap: "CA Hà Nội",
      ngayCap: "2019-06-01",
      gioiTinh: "Nam",
      tinhThanh: "Hà Nội",
      soTienYeuCau: 30000000,
      ghiChuCTV: "",
      ctvId: "u4",
      tsaId: null,
      statusId: 2,
      createdAt: now,
      updatedAt: now,
      history: [
        { statusId: 1, note: "Import lead", by: "Phạm CTV 1", at: now },
        { statusId: 2, note: "R02 – KH nợ xấu/chú ý", by: "Nguyễn Admin", at: now },
      ],
      approval: null,
    },
    {
      id: "LD-20260801-003",
      hoTen: "Hoàng Minh Tuấn",
      cccd: "079123456789",
      sdt: "0987654321",
      ngaySinh: "1995-11-08",
      noiCap: "CA Đồng Nai",
      ngayCap: "2021-03-15",
      gioiTinh: "Nam",
      tinhThanh: "Đồng Nai",
      soTienYeuCau: 40000000,
      ghiChuCTV: "Vay mua xe",
      ctvId: "u5",
      tsaId: "u3",
      statusId: 6,
      createdAt: now,
      updatedAt: now,
      history: [
        { statusId: 1, note: "Import lead", by: "Hoàng CTV 2", at: now },
        { statusId: 4, note: "Pass Check Dup", by: "Lê TSA 2", at: now },
        { statusId: 5, note: "Đã gọi, chờ giấy tờ", by: "Lê TSA 2", at: now },
        { statusId: 6, note: "UW01 – Hồ sơ đang thẩm định", by: "Lê TSA 2", at: now },
      ],
      approval: null,
    },
  ];
}

// Global in-memory store (persists while server process lives)
const g = globalThis as unknown as { __crmStore?: { users: User[]; leads: Lead[] } };
if (!g.__crmStore) {
  g.__crmStore = { users: USERS, leads: seedLeads() };
}

export function getUsers() {
  return g.__crmStore!.users;
}
export function getUser(id: string) {
  return g.__crmStore!.users.find((u) => u.id === id);
}
export function getLeads() {
  return g.__crmStore!.leads;
}
export function getLead(id: string) {
  return g.__crmStore!.leads.find((l) => l.id === id);
}
export function addLead(lead: Lead) {
  g.__crmStore!.leads.push(lead);
  return lead;
}
export function updateLead(id: string, patch: Partial<Lead>) {
  const idx = g.__crmStore!.leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  g.__crmStore!.leads[idx] = { ...g.__crmStore!.leads[idx], ...patch };
  return g.__crmStore!.leads[idx];
}
export function filterLeadsForUser(user: User) {
  const leads = getLeads();
  if (user.role === "CTV") return leads.filter((l) => l.ctvId === user.id);
  if (user.role === "TSA") return leads.filter((l) => l.tsaId === user.id);
  return leads;
}
