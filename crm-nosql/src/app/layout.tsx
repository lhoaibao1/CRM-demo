import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3RD CRM",
  description: "CRM nội bộ quản lý Lead & Hồ sơ vay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
