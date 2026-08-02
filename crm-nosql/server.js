/**
 * 3RD CRM Demo – Pure Node.js + NoSQL (JSON document store)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PUBLIC = path.join(__dirname, 'public');

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { return null; }
}
function writeDB(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}
function ensureDB() {
  let db = readDB();
  if (db) return db;
  const now = new Date().toISOString();
  db = {
    users: [
      { id: 'u1', hoTen: 'Nguyễn Admin', role: 'Admin', sdt: '0901000001', cccd: '001000000001' },
      { id: 'u2', hoTen: 'Trần TSA 1', role: 'TSA', sdt: '0902000001', cccd: '001000000002' },
      { id: 'u3', hoTen: 'Lê TSA 2', role: 'TSA', sdt: '0902000002', cccd: '001000000003' },
      { id: 'u4', hoTen: 'Phạm CTV 1', role: 'CTV', sdt: '0903000001', cccd: '001000000004' },
      { id: 'u5', hoTen: 'Hoàng CTV 2', role: 'CTV', sdt: '0903000002', cccd: '001000000005' },
    ],
    leads: [
      {
        id: 'LD-20260801-001', hoTen: 'Trần Thị Bích', cccd: '001234567890', sdt: '0901234567',
        ngaySinh: '1990-05-15', noiCap: 'CA TP.HCM', ngayCap: '2020-01-10', gioiTinh: 'Nữ',
        tinhThanh: 'TP. Hồ Chí Minh', soTienYeuCau: 50000000, ghiChuCTV: 'Cần vay tiêu dùng',
        ctvId: 'u4', tsaId: 'u2', statusId: 8, createdAt: now, updatedAt: now,
        history: [
          { statusId: 1, note: 'Import lead', by: 'Phạm CTV 1', at: now },
          { statusId: 4, note: 'Pass Check Dup', by: 'Trần TSA 1', at: now },
          { statusId: 5, note: 'KH đã gửi giấy tờ', by: 'Trần TSA 1', at: now },
          { statusId: 6, note: 'UW01 – Hồ sơ đang thẩm định', by: 'Trần TSA 1', at: now },
          { statusId: 8, note: 'UW02 – Hồ sơ được duyệt', by: 'Trần TSA 1', at: now },
        ],
        approval: { soTienDuyet: 50000000, bhkv: 'Có', thucNhan: 48000000, laiSuat: 18, thoiHan: 12, ngayTra: 5, traThang: 4500000 }
      },
      {
        id: 'LD-20260801-002', hoTen: 'Lê Hoàng Nam', cccd: '001987654321', sdt: '0912345678',
        ngaySinh: '1988-03-20', noiCap: 'CA Hà Nội', ngayCap: '2019-06-01', gioiTinh: 'Nam',
        tinhThanh: 'Hà Nội', soTienYeuCau: 30000000, ghiChuCTV: '',
        ctvId: 'u4', tsaId: null, statusId: 2, createdAt: now, updatedAt: now,
        history: [
          { statusId: 1, note: 'Import lead', by: 'Phạm CTV 1', at: now },
          { statusId: 2, note: 'R02 – KH nợ xấu/chú ý', by: 'Nguyễn Admin', at: now },
        ],
        approval: null
      },
      {
        id: 'LD-20260801-003', hoTen: 'Hoàng Minh Tuấn', cccd: '079123456789', sdt: '0987654321',
        ngaySinh: '1995-11-08', noiCap: 'CA Đồng Nai', ngayCap: '2021-03-15', gioiTinh: 'Nam',
        tinhThanh: 'Đồng Nai', soTienYeuCau: 40000000, ghiChuCTV: 'Vay mua xe',
        ctvId: 'u5', tsaId: 'u3', statusId: 6, createdAt: now, updatedAt: now,
        history: [
          { statusId: 1, note: 'Import lead', by: 'Hoàng CTV 2', at: now },
          { statusId: 4, note: 'Pass Check Dup', by: 'Lê TSA 2', at: now },
          { statusId: 5, note: 'Đã gọi, chờ giấy tờ', by: 'Lê TSA 2', at: now },
          { statusId: 6, note: 'UW01 – Hồ sơ đang thẩm định', by: 'Lê TSA 2', at: now },
        ],
        approval: null
      },
    ],
  };
  writeDB(db);
  return db;
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
  });
  res.end(JSON.stringify(data));
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) reject(new Error('too large')); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('invalid json')); }
    });
  });
}
function getUser(req) {
  const id = req.headers['x-user-id'];
  if (!id) return null;
  return ensureDB().users.find(u => u.id === id) || null;
}

async function handleAPI(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const db = ensureDB();
  const parts = url.pathname.replace(/^\/api/, '').split('/').filter(Boolean);

  if (parts[0] === 'users' && req.method === 'GET' && parts.length === 1)
    return json(res, 200, db.users);

  if (parts[0] === 'users' && parts[1] && req.method === 'GET') {
    const u = db.users.find(x => x.id === parts[1] || x.role === parts[1]);
    if (!u) return json(res, 404, { error: 'User not found' });
    return json(res, 200, u);
  }

  if (parts[0] === 'leads' && req.method === 'GET' && parts.length === 1) {
    const user = getUser(req);
    let leads = db.leads;
    if (user) {
      if (user.role === 'CTV') leads = leads.filter(l => l.ctvId === user.id);
      else if (user.role === 'TSA') leads = leads.filter(l => l.tsaId === user.id);
    }
    return json(res, 200, leads);
  }

  if (parts[0] === 'leads' && parts[1] && req.method === 'GET' && parts.length === 2) {
    const lead = db.leads.find(l => l.id === parts[1]);
    if (!lead) return json(res, 404, { error: 'Lead not found' });
    return json(res, 200, lead);
  }

  if (parts[0] === 'leads' && req.method === 'POST' && parts.length === 1) {
    const user = getUser(req);
    if (!user || (user.role !== 'CTV' && user.role !== 'Admin'))
      return json(res, 403, { error: 'Chỉ CTV/Admin được tạo Lead' });
    const body = await parseBody(req);
    const num = String(db.leads.length + 1).padStart(3, '0');
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const id = 'LD-' + today + '-' + num;
    const now = new Date().toISOString();
    const lead = {
      id, hoTen: body.hoTen, cccd: body.cccd, sdt: body.sdt,
      ngaySinh: body.ngaySinh, noiCap: body.noiCap, ngayCap: body.ngayCap,
      gioiTinh: body.gioiTinh, tinhThanh: body.tinhThanh,
      soTienYeuCau: Number(body.soTienYeuCau) || 0, ghiChuCTV: body.ghiChuCTV || '',
      ctvId: user.role === 'CTV' ? user.id : (body.ctvId || user.id),
      tsaId: null, statusId: 1, createdAt: now, updatedAt: now,
      history: [{ statusId: 1, note: 'Import lead', by: user.hoTen, at: now }],
      approval: null,
    };
    db.leads.push(lead);
    writeDB(db);
    return json(res, 201, lead);
  }

  if (parts[0] === 'leads' && parts[2] === 'status' && req.method === 'PATCH') {
    const user = getUser(req);
    if (!user || (user.role !== 'Admin' && user.role !== 'TSA'))
      return json(res, 403, { error: 'Không có quyền' });
    const lead = db.leads.find(l => l.id === parts[1]);
    if (!lead) return json(res, 404, { error: 'Lead not found' });
    if (user.role === 'TSA' && lead.tsaId !== user.id)
      return json(res, 403, { error: 'Lead chưa được gán cho bạn' });
    const body = await parseBody(req);
    const now = new Date().toISOString();
    lead.statusId = Number(body.statusId);
    lead.updatedAt = now;
    lead.history.push({ statusId: lead.statusId, note: body.note || '', by: user.hoTen, at: now });
    if (body.approval) lead.approval = body.approval;
    writeDB(db);
    return json(res, 200, lead);
  }

  if (parts[0] === 'leads' && parts[2] === 'assign' && req.method === 'PATCH') {
    const user = getUser(req);
    if (!user || user.role !== 'Admin') return json(res, 403, { error: 'Chỉ Admin được gán' });
    const lead = db.leads.find(l => l.id === parts[1]);
    if (!lead) return json(res, 404, { error: 'Lead not found' });
    const body = await parseBody(req);
    lead.tsaId = body.tsaId;
    lead.updatedAt = new Date().toISOString();
    writeDB(db);
    return json(res, 200, lead);
  }

  if (parts[0] === 'leads' && parts[2] === 'pushback' && req.method === 'PATCH') {
    const user = getUser(req);
    if (!user || user.role !== 'CTV') return json(res, 403, { error: 'Chỉ CTV' });
    const lead = db.leads.find(l => l.id === parts[1]);
    if (!lead || lead.ctvId !== user.id) return json(res, 404, { error: 'Lead not found' });
    if (lead.statusId !== 10) return json(res, 400, { error: 'Chỉ đẩy lại khi Trả về Sale' });
    let prev = 1;
    for (let i = lead.history.length - 1; i >= 0; i--) {
      if (lead.history[i].statusId !== 10) { prev = lead.history[i].statusId; break; }
    }
    const now = new Date().toISOString();
    lead.statusId = prev;
    lead.updatedAt = now;
    lead.history.push({ statusId: prev, note: 'CTV đẩy lại sau khi bổ sung', by: user.hoTen, at: now });
    writeDB(db);
    return json(res, 200, lead);
  }

  return json(res, 404, { error: 'API not found' });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + req.headers.host);
    if (url.pathname.startsWith('/api')) return await handleAPI(req, res, url);
    let filePath = path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!filePath.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory())
      filePath = path.join(PUBLIC, 'index.html');
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    console.error(e);
    json(res, 500, { error: e.message });
  }
});

ensureDB();
server.listen(PORT, '0.0.0.0', () => {
  console.log('\\n  3RD CRM Demo → http://localhost:' + PORT);
  console.log('  NoSQL DB → ' + DB_PATH + '\\n');
});
