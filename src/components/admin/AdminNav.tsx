"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Tr } from "@/lib/admin-lang";
import { useTr } from "./AdminLang";

const groups = (tr: Tr) => [
  {
    title: tr("Tổng quan", "Overview"),
    items: [{ href: "/dashboard", label: tr("Trang quản trị", "Dashboard"), icon: "/img/ui/admin/icon-dashboard.svg", exact: true }],
  },
  {
    title: tr("Hệ thống", "System"),
    items: [
      { href: "/dashboard/settings", label: tr("Cài đặt chung", "General settings"), icon: "icon-baffle-board.png" },
      { href: "/dashboard/messages", label: tr("Tin nhắn liên hệ", "Contact messages"), icon: "icon-contact.png", badge: true },
      { href: "/dashboard/users", label: tr("Tài khoản admin", "Admin accounts"), icon: "icon-password.png" },
      { href: "/dashboard/maintenance", label: tr("Bảo trì & sao lưu", "Maintenance & backups"), icon: "icon-changelog.png" },
    ],
  },
  {
    title: tr("Nội dung", "Content"),
    // Cùng thứ tự với menu của website
    items: [
      { href: "/dashboard/pages/home", label: "Home", icon: "icon-home.png" },
      { href: "/dashboard/yokai", label: "Yo-kai (Medallium)", icon: "icon-medallium.png" },
      { href: "/dashboard/qr-code", label: "QR Code", icon: "icon-qr-code.png" },
      { href: "/dashboard/baffle-board", label: "Baffle Board", icon: "icon-baffle-board.png" },
      { href: "/dashboard/attitudes", label: "Attitudes", icon: "icon-attitudes.png" },
      { href: "/dashboard/passwords", label: "Password", icon: "icon-password.png" },
      { href: "/dashboard/special-souls", label: "RARE Special Soul", icon: "icon-soul.png" },
      { href: "/dashboard/food", label: "Food", icon: "icon-food.png" },
      { href: "/dashboard/pages/privacy-policy", label: "Privacy Policy", icon: "icon-policy.png" },
      { href: "/dashboard/changelog", label: "Changelog", icon: "icon-changelog.png" },
    ],
  },
];

export default function AdminNav({ unread, children }: { unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const { tr } = useTr();
  const [open, setOpen] = useState(false);

  // mobile: khoá cuộn trang khi menu đang mở
  useEffect(() => {
    document.documentElement.classList.toggle("a-menu-lock", open);
    return () => document.documentElement.classList.remove("a-menu-lock");
  }, [open]);

  return (
    <div className="a-layout">
      <aside className={open ? "a-sidebar open" : "a-sidebar"}>
        <div className="a-brand">
          <img src="/img/ui/icon-logo.webp" alt="" /> YokaiDex
        </div>
        <nav>
          {groups(tr).map((g) => (
            <div key={g.title}>
              <div className="a-nav-group">{g.title}</div>
              {g.items.map((it) => {
                const active = "exact" in it && it.exact ? pathname === it.href : pathname.startsWith(it.href);
                return (
                  <Link key={it.href} href={it.href} className={active ? "active" : undefined} onClick={() => setOpen(false)}>
                    <img src={it.icon.startsWith("/") ? it.icon : `/img/ui/menu/${it.icon}`} alt="" />
                    {it.label}
                    {"badge" in it && it.badge && unread > 0 && <span className="a-badge">{unread}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="a-main" onClick={() => open && setOpen(false)}>
        {!open && (
          <button
            type="button"
            className="a-btn a-btn-sm a-menu-btn"
            style={{ position: "fixed", top: 14, left: 12, zIndex: 60 }}
            aria-label={tr("Mở menu", "Open menu")}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            ☰
          </button>
          )}
        {children}
      </div>
    </div>
  );
}
