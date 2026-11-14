import { Suspense } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "../actions";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const unread = await prisma.contactMessage.count({ where: { read: false } });
  return (
    <AdminNav unread={unread}>
      <header className="a-topbar">
        <span />
        <div className="a-user">
          <a href="/" target="_blank" rel="noreferrer">
            Xem website ↗
          </a>
          <span>{user.name || user.username || user.email}</span>
          <form action={logout}>
            <button className="a-btn a-btn-sm">Đăng xuất</button>
          </form>
        </div>
      </header>
      <main className="a-content">{children}</main>
    </AdminNav>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="a-content">Đang tải...</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
