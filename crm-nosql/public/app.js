// 3RD CRM Demo – Frontend (API + NoSQL backend)
const API = '';  // same origin
const STATUSES = [
  { id: 1, name: "Chờ Check Dup thông tin sơ bộ", step: "—", type: "start", color: "yellow" },
  { id: 2, name: "Nợ xấu/Chú ý", step: "No Pass", type: "close", color: "red" },
  { id: 3, name: "Hồ sơ Reject <90 ngày", step: "No Pass", type: "close", color: "red" },
  { id: 4, name: "TSA đang thực hiện cuộc gọi tư vấn", step: "Pass", type: "process", color: "blue" },
  { id: 5, name: "Khách hàng bổ sung hồ sơ vay", step: "Pass", type: "process", color: "blue" },
  { id: 6, name: "Đang thẩm định", step: "Pass", type: "process", color: "blue" },
  { id: 7, name: "Thẩm định từ chối", step: "Close", type: "close", color: "red" },
  { id: 8, name: "Đã phê duyệt", step: "Pass", type: "approve", color: "green" },
  { id: 9, name: "Hồ sơ END", step: "Close", type: "close", color: "red" },
  { id: 10, name: "Trả về Sale", step: "—", type: "return", color: "orange" },
];
const WORKFLOW = { 1:[2,3,4], 2:[], 3:[], 4:[5,10], 5:[6], 6:[7,8,10], 7:[], 8:[9], 9:[], 10:[] };
const NOTE_FORMS = { D01:"Khách hàng không nghe máy", D02:"Thuê bao", R01:"KH bị rj <90 ngày", R02:"KH nợ xấu/chú ý", R03:"KH bị từ chối", UW01:"Hồ sơ đang thẩm định", UW02:"Hồ sơ được duyệt" };

let currentUser = null, currentLeadId = null, pendingApproveData = null, usersCache = [], leadsCache = [];

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (currentUser) opts.headers['X-User-Id'] = currentUser.id;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function login(role) {
  try {
    currentUser = await api('GET', '/api/users/' + role);
    usersCache = await api('GET', '/api/users');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('user-label').textContent = currentUser.hoTen + ' (' + currentUser.role + ')';
    buildSidebar();
    showPage('dashboard');
  } catch (e) { alert('Login lỗi: ' + e.message); }
}
function logout() {
  currentUser = null;
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}

function buildSidebar() {
  const role = currentUser.role;
  let items = [{ id: 'dashboard', label: 'Dashboard' }];
  if (role === 'CTV') { items.push({ id: 'import', label: 'Import Lead' }, { id: 'leads', label: 'Lead của tôi' }); }
  else if (role === 'TSA') { items.push({ id: 'leads', label: 'Lead được gán' }); }
  else { items.push({ id: 'leads', label: 'Tất cả Lead' }, { id: 'assign', label: 'Phân bổ Lead' }, { id: 'users', label: 'Quản lý User' }); }
  document.getElementById('sidebar').innerHTML = items.map(i =>
    '<a data-page="'+i.id+'" onclick="showPage(\''+i.id+'\')">'+i.label+'</a>').join('');
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  if (page === 'dashboard') renderDashboard();
  if (page === 'leads') renderLeads();
  if (page === 'assign') renderAssign();
  if (page === 'users') renderUsers();
}

function getUserName(id) { const u = usersCache.find(x => x.id === id); return u ? u.hoTen : '—'; }
function getStatus(id) { return STATUSES.find(s => s.id === id); }
function badgeClass(c) { return 'badge badge-' + c; }
function formatMoney(n) { if (n==null||n==='') return '—'; return Number(n).toLocaleString('vi-VN') + ' đ'; }
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
}

async function loadLeads() {
  leadsCache = await api('GET', '/api/leads');
  return leadsCache;
}

async function renderDashboard() {
  const leads = await loadLeads();
  const total = leads.length;
  const processing = leads.filter(l => [1,4,5,6].includes(l.statusId)).length;
  const approved = leads.filter(l => l.statusId === 8 || l.statusId === 9).length;
  const rejected = leads.filter(l => [2,3,7].includes(l.statusId)).length;
  document.getElementById('stats-cards').innerHTML =
    '<div class="stat-card"><div class="num">'+total+'</div><div class="lbl">Tổng Lead</div></div>' +
    '<div class="stat-card"><div class="num">'+processing+'</div><div class="lbl">Đang xử lý</div></div>' +
    '<div class="stat-card"><div class="num">'+approved+'</div><div class="lbl">Đã duyệt / END</div></div>' +
    '<div class="stat-card"><div class="num">'+rejected+'</div><div class="lbl">Từ chối / Nợ xấu</div></div>';
  const recent = leads.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5);
  document.getElementById('recent-leads').innerHTML = recent.length === 0 ? '<p style="color:#999">Chưa có lead</p>' :
    '<table><thead><tr><th>Mã</th><th>Họ tên</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>' +
    recent.map(l => { const st=getStatus(l.statusId); return '<tr><td>'+l.id+'</td><td>'+l.hoTen+'</td><td><span class="'+badgeClass(st.color)+'">'+st.name+'</span></td><td>'+formatDate(l.updatedAt)+'</td></tr>'; }).join('') +
    '</tbody></table>';
}

async function renderLeads() {
  const sel = document.getElementById('filter-status');
  if (sel.options.length <= 1) STATUSES.forEach(s => { const o=document.createElement('option'); o.value=s.id; o.textContent=s.name; sel.appendChild(o); });
  const q = (document.getElementById('search-input').value||'').toLowerCase();
  const fStatus = document.getElementById('filter-status').value;
  let leads = await loadLeads();
  if (q) leads = leads.filter(l => l.hoTen.toLowerCase().includes(q)||l.cccd.includes(q)||l.sdt.includes(q)||l.id.toLowerCase().includes(q));
  if (fStatus) leads = leads.filter(l => String(l.statusId)===fStatus);
  document.querySelector('#leads-table tbody').innerHTML = leads.map(l => {
    const st = getStatus(l.statusId);
    return '<tr><td>'+l.id+'</td><td>'+l.hoTen+'</td><td>'+l.sdt+'</td><td>'+getUserName(l.ctvId)+'</td><td>'+getUserName(l.tsaId)+'</td><td><span class="'+badgeClass(st.color)+'">'+st.name+'</span></td><td>'+formatDate(l.createdAt)+'</td><td><button class="btn-link" onclick="openDetail(\''+l.id+'\')">Chi tiết</button></td></tr>';
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:#999">Không có lead</td></tr>';
}

async function openDetail(id) {
  currentLeadId = id;
  showPage('detail');
  const l = await api('GET', '/api/leads/' + id);
  const st = getStatus(l.statusId);
  document.getElementById('detail-title').textContent = l.id + ' – ' + l.hoTen;
  let actions = '';
  const role = currentUser.role;
  const nextIds = WORKFLOW[l.statusId] || [];
  if ((role==='Admin'||role==='TSA') && nextIds.length>0) {
    if (!(role==='TSA' && l.tsaId !== currentUser.id))
      actions += '<button class="btn primary" style="margin-right:8px" onclick="openStatusModal()">Cập nhật trạng thái</button>';
  }
  if (role==='CTV' && l.statusId===10 && l.ctvId===currentUser.id)
    actions += '<button class="btn primary" onclick="ctvPushBack()">Đẩy lại (sau khi bổ sung)</button>';
  if (role==='Admin' && !l.tsaId)
    actions += '<button class="btn" style="margin-right:8px;background:#ED7D31;color:#fff" onclick="openAssignModal(\''+l.id+'\')">Gán TSA</button>';

  let approvalHtml = '';
  if (l.approval) {
    const a = l.approval;
    approvalHtml = '<div class="card"><h3>Thông tin phê duyệt</h3><div class="detail-grid">' +
      '<div><div class="lbl">Số tiền phê duyệt</div><div class="val">'+formatMoney(a.soTienDuyet)+'</div></div>' +
      '<div><div class="lbl">BHKV</div><div class="val">'+a.bhkv+'</div></div>' +
      '<div><div class="lbl">Số tiền thực nhận</div><div class="val">'+formatMoney(a.thucNhan)+'</div></div>' +
      '<div><div class="lbl">Lãi suất</div><div class="val">'+a.laiSuat+'%/năm</div></div>' +
      '<div><div class="lbl">Thời hạn vay</div><div class="val">'+a.thoiHan+' tháng</div></div>' +
      '<div><div class="lbl">Ngày trả hằng tháng</div><div class="val">Ngày '+a.ngayTra+'</div></div>' +
      '<div><div class="lbl">Số tiền trả hằng tháng</div><div class="val">'+formatMoney(a.traThang)+'</div></div></div></div>';
  }
  const historyHtml = (l.history||[]).map(h => {
    const hs = getStatus(h.statusId);
    return '<div class="history-item"><strong>'+hs.name+'</strong> – '+h.note+'<br><span class="time">'+h.by+' · '+formatDate(h.at)+'</span></div>';
  }).reverse().join('');

  document.getElementById('detail-content').innerHTML =
    '<div style="margin-bottom:12px">'+actions+'</div>' +
    '<div class="card"><h3>Thông tin Lead</h3><div class="detail-grid">' +
    '<div><div class="lbl">Họ tên</div><div class="val">'+l.hoTen+'</div></div>' +
    '<div><div class="lbl">CCCD</div><div class="val">'+l.cccd+'</div></div>' +
    '<div><div class="lbl">SĐT</div><div class="val">'+l.sdt+'</div></div>' +
    '<div><div class="lbl">Ngày sinh</div><div class="val">'+l.ngaySinh+'</div></div>' +
    '<div><div class="lbl">Nơi cấp</div><div class="val">'+l.noiCap+'</div></div>' +
    '<div><div class="lbl">Ngày cấp</div><div class="val">'+l.ngayCap+'</div></div>' +
    '<div><div class="lbl">Giới tính</div><div class="val">'+l.gioiTinh+'</div></div>' +
    '<div><div class="lbl">Tỉnh thành</div><div class="val">'+l.tinhThanh+'</div></div>' +
    '<div><div class="lbl">Số tiền yêu cầu</div><div class="val">'+formatMoney(l.soTienYeuCau)+'</div></div>' +
    '<div><div class="lbl">CTV</div><div class="val">'+getUserName(l.ctvId)+'</div></div>' +
    '<div><div class="lbl">TSA</div><div class="val">'+getUserName(l.tsaId)+'</div></div>' +
    '<div><div class="lbl">Trạng thái</div><div class="val"><span class="'+badgeClass(st.color)+'">'+st.name+'</span></div></div>' +
    '<div><div class="lbl">Ghi chú CTV</div><div class="val">'+(l.ghiChuCTV||'—')+'</div></div></div></div>' +
    approvalHtml +
    '<div class="card"><h3>Lịch sử trạng thái</h3>'+(historyHtml||'<p style="color:#999">Chưa có</p>')+'</div>';
}

function openStatusModal() {
  const l = leadsCache.find(x => x.id === currentLeadId);
  const nextIds = WORKFLOW[l.statusId] || [];
  document.getElementById('new-status').innerHTML = nextIds.map(id => {
    const s = getStatus(id); return '<option value="'+id+'">'+s.name+'</option>';
  }).join('');
  document.getElementById('note-form').value = '';
  document.getElementById('custom-note').value = '';
  document.getElementById('custom-note-wrap').classList.add('hidden');
  document.getElementById('modal-status').classList.remove('hidden');
}
function toggleCustomNote() {
  document.getElementById('custom-note-wrap').classList.toggle('hidden', document.getElementById('note-form').value !== 'CUSTOM');
}
async function confirmStatus() {
  const newId = Number(document.getElementById('new-status').value);
  const formVal = document.getElementById('note-form').value;
  let note = '';
  if (!formVal) { alert('Vui lòng chọn ghi chú!'); return; }
  if (formVal === 'CUSTOM') {
    note = document.getElementById('custom-note').value.trim();
    if (!note) { alert('Vui lòng nhập ghi chú!'); return; }
  } else note = formVal + ' – ' + NOTE_FORMS[formVal];
  if (newId === 8) {
    pendingApproveData = { newId, note };
    closeModal('modal-status');
    document.getElementById('modal-approve').classList.remove('hidden');
    return;
  }
  await applyStatusChange(newId, note, null);
  closeModal('modal-status');
}
async function confirmApprove() {
  const soTienDuyet = document.getElementById('ap-soTienDuyet').value;
  const bhkv = document.getElementById('ap-bhkv').value;
  const thucNhan = document.getElementById('ap-thucNhan').value;
  const laiSuat = document.getElementById('ap-laiSuat').value;
  const thoiHan = document.getElementById('ap-thoiHan').value;
  const ngayTra = document.getElementById('ap-ngayTra').value;
  const traThang = document.getElementById('ap-traThang').value;
  if (!soTienDuyet||!thucNhan||!laiSuat||!thoiHan||!ngayTra||!traThang) { alert('Điền đủ thông tin phê duyệt!'); return; }
  const approval = { soTienDuyet:+soTienDuyet, bhkv, thucNhan:+thucNhan, laiSuat:+laiSuat, thoiHan:+thoiHan, ngayTra:+ngayTra, traThang:+traThang };
  await applyStatusChange(pendingApproveData.newId, pendingApproveData.note, approval);
  closeModal('modal-approve');
  pendingApproveData = null;
}
async function applyStatusChange(newId, note, approval) {
  await api('PATCH', '/api/leads/' + currentLeadId + '/status', { statusId: newId, note, approval });
  await openDetail(currentLeadId);
}
async function ctvPushBack() {
  await api('PATCH', '/api/leads/' + currentLeadId + '/pushback', {});
  await openDetail(currentLeadId);
  alert('Đã đẩy lại Lead về bước trước!');
}

async function renderAssign() {
  const leads = (await loadLeads()).filter(l => !l.tsaId && ![2,3,9].includes(l.statusId));
  document.getElementById('assign-list').innerHTML = leads.length === 0 ? '<p style="color:#999">Không có lead cần gán</p>' :
    '<table><thead><tr><th>Mã</th><th>Họ tên</th><th>CTV</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
    leads.map(l => { const st=getStatus(l.statusId); return '<tr><td>'+l.id+'</td><td>'+l.hoTen+'</td><td>'+getUserName(l.ctvId)+'</td><td><span class="'+badgeClass(st.color)+'">'+st.name+'</span></td><td><button class="btn-link" onclick="openAssignModal(\''+l.id+'\')">Gán TSA</button></td></tr>'; }).join('') +
    '</tbody></table>';
}
function openAssignModal(leadId) {
  currentLeadId = leadId;
  const l = leadsCache.find(x => x.id === leadId) || { id: leadId, hoTen: '' };
  document.getElementById('assign-lead-name').textContent = l.id + ' – ' + (l.hoTen||'');
  document.getElementById('assign-tsa').innerHTML = usersCache.filter(u => u.role==='TSA').map(t =>
    '<option value="'+t.id+'">'+t.hoTen+'</option>').join('');
  document.getElementById('modal-assign').classList.remove('hidden');
}
async function confirmAssign() {
  const tsaId = document.getElementById('assign-tsa').value;
  await api('PATCH', '/api/leads/' + currentLeadId + '/assign', { tsaId });
  closeModal('modal-assign');
  renderAssign();
  alert('Đã gán TSA thành công!');
}

async function submitLead(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.soTienYeuCau = Number(body.soTienYeuCau);
  try {
    const lead = await api('POST', '/api/leads', body);
    e.target.reset();
    alert('Tạo Lead thành công: ' + lead.id);
    showPage('leads');
  } catch (err) { alert(err.message); }
}

function renderUsers() {
  document.getElementById('users-tbody').innerHTML = usersCache.map(u =>
    '<tr><td>'+u.hoTen+'</td><td>'+u.role+'</td><td>'+u.sdt+'</td><td>'+u.cccd+'</td></tr>').join('');
}
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
