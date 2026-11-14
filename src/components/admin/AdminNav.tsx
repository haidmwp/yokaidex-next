"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const GROUPS = [
  {
    title: "Tổng quan",
    items: [{ href: "/admin", label: "Dashboard", icon: "icon-home.png", exact: true }],
  },
  {
    title: "Nội dung",
    // Cùng thứ tự với menu của website
    items: [
      { href: "/admin/pages/home", label: "Home", icon: "icon-home.png" },
      { href: "/admin/yokai", label: "Yo-kai (Medallium)", icon: "icon-medallium.png" },
      { href: "/admin/qr-code", label: "QR Code", icon: "icon-qr-code.png" },
      { href: "/admin/baffle-board", label: "Baffle Board", icon: "icon-baffle-board.png" },
      { href: "/admin/attitudes", label: "Attitudes", icon: "icon-attitudes.png" },
      { href: "/admin/passwords", label: "Password", icon: "icon-password.png" },
      { href: "/admin/special-souls", label: "RARE Special Soul", icon: "icon-soul.png" },
      { href: "/admin/food", label: "Food", icon: "icon-food.png" },
      { href: "/admin/pages/privacy-policy", label: "Privacy Policy", icon: "icon-policy.png" },
      { href: "/admin/changelog", label: "Changelog", icon: "icon-changelog.png" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/messages", label: "Tin nhắn liên hệ", icon: "icon-contact.png", badge: true },
      { href: "/admin/users", label: "Tài khoản admin", icon: "icon-password.png" },
    ],
  },
];

export default function AdminNav({ unread, children }: { unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="a-layout">
      <aside className={open ? "a-sidebar open" : "a-sidebar"}>
        <div className="a-brand">
          <img src="/img/ui/icon-logo.webp" alt="" /> YokaiDex
        </div>
        <nav>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="a-nav-group">{g.title}</div>
              {g.items.map((it) => {
                const active = "exact" in it && it.exact ? pathname === it.href : pathname.startsWith(it.href);
                return (
                  <Link key={it.href} href={it.href} className={active ? "active" : undefined} onClick={() => setOpen(false)}>
                    <img src={`/img/ui/menu/${it.icon}`} alt="" />
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
            aria-label="Mở menu"
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
