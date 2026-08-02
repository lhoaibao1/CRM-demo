# 3RD CRM Demo

CRM nội bộ quản lý Lead & Hồ sơ vay – Demo với **NoSQL** (JSON document store).

## Chạy demo

```bash
# Không cần cài package ngoài – pure Node.js
node server.js
```

Mở trình duyệt: **http://localhost:3000**

## Đăng nhập demo

| Role  | Mô tả |
|-------|--------|
| Admin | Full quyền, gán Lead cho TSA |
| TSA   | Xử lý Lead được gán, cập nhật trạng thái |
| CTV   | Import Lead, xem Lead của mình |

## NoSQL Database

- File: `data/db.json`
- Kiểu: Document store (JSON)
- Collections: `users`, `leads`
- Tự seed dữ liệu mẫu lần đầu chạy

## API

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/users` | Danh sách user |
| GET | `/api/users/:role` | Login theo role |
| GET | `/api/leads` | Danh sách lead (theo quyền) |
| POST | `/api/leads` | Import lead (CTV) |
| PATCH | `/api/leads/:id/status` | Cập nhật trạng thái |
| PATCH | `/api/leads/:id/assign` | Gán TSA (Admin) |
| PATCH | `/api/leads/:id/pushback` | CTV đẩy lại |

Header: `X-User-Id: u1` (hoặc u2, u3...)

## Deploy

- VPS: `node server.js` hoặc dùng PM2
- GitHub: push repo này lên, clone về server chạy

## Stack

- Backend: Node.js (built-in `http` + `fs`)
- Frontend: HTML/CSS/JS
- DB: NoSQL document file (`data/db.json`)
