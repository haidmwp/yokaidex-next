import { Suspense } from "react";
import AdminNav from "@/components/admin/AdminNav";
import { AdminLangProvider, LangSwitch } from "@/components/admin/AdminLang";
import { requireAdmin } from "@/lib/auth";
import { getTr } from "@/lib/admin-lang-server";
import { prisma } from "@/lib/prisma";
import { logout } from "../actions";

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const { lang, tr } = await getTr();
  const unread = await prisma.contactMessage.count({ where: { read: false } });
  return (
    <AdminLangProvider lang={lang}>
      <AdminNav unread={unread}>
        <header className="a-topbar">
          <span />
          <div className="a-user">
            <LangSwitch />
            <a href="/" target="_blank" rel="noreferrer">
              {tr("Xem website ↗", "View website ↗")}
            </a>
            <span className="a-user-name">{user.name || user.username || user.email}</span>
            <form action={logout}>
              <button className="a-btn a-btn-sm">{tr("Đăng xuất", "Log out")}</button>
            </form>
          </div>
        </header>
        <main className="a-content">{children}</main>
      </AdminNav>
    </AdminLangProvider>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="a-content">…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
