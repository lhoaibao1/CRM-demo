# 3RD CRM – Next.js Demo

CRM nội bộ quản lý Lead & Hồ sơ vay.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- In-memory NoSQL store (demo)

## Chạy local
```bash
npm install
npm run dev
```
Mở http://localhost:3000

## Deploy Render
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Root Directory: để trống (nếu code ở root repo)

## Roles
- **Admin** – full, gán Lead
- **TSA** – xử lý Lead được gán
- **CTV** – import Lead, xem của mình
