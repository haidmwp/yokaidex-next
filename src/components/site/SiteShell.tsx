"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, createContext, useCallback, useContext, useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import ThemeToggle from "@/components/ThemeToggle";

const SidebarContext = createContext<{ toggle: () => void }>({ toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

function isActive(pathname: string, match: string[]) {
  return match.some((m) =>
    m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(m + "/") || pathname.startsWith(m + "-"),
  );
}

/** Mục con đang mở: trang hiện tại là trang đó hoặc trang con của nó (vd. /yokai-watch-1/jibanyan). */
const isChildActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/");

/** Danh sách link menu; `pathname` rỗng = chưa biết (lúc prerender) → không đánh dấu active. */
function SidebarLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  // menu con: mặc định mở khi đang ở trong nhóm đó, người xem bấm mũi tên để mở/đóng
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  // bấm một mục bất kỳ: đóng hết các menu con (lần mở menu sau không còn bung sẵn) rồi đóng sidebar
  const navigate = () => {
    setToggled(Object.fromEntries(NAV_ITEMS.filter((i) => i.children).map((i) => [i.href, false])));
    onNavigate();
  };
  return (
    <ul className="sidebar-content">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.match);
        const expanded = toggled[item.href] ?? active;
        return (
          <li key={item.href} className={item.divider ? `sidebar-${item.href === "/" ? "home" : item.href.slice(1)}-link` : undefined}>
            <div className="sidebar-item">
              <Link href={item.href} onClick={navigate} className={active ? "active nav-link" : "nav-link"}>
                <img alt="icon" className="icon-menu" src={`/img/ui/menu/${item.icon}`} /> {item.label}
              </Link>
              {item.children && (
                <button
                  type="button"
                  className={expanded ? "sidebar-sub-toggle open" : "sidebar-sub-toggle"}
                  aria-expanded={expanded}
                  aria-label={`${item.label}: Yo-kai Watch 1 / 2 / 3`}
                  onClick={() => setToggled((t) => ({ ...t, [item.href]: !expanded }))}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            {item.children && expanded && (
              <ul className="sidebar-sub">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} onClick={navigate} className={isChildActive(pathname, c.href) ? "active-sub nav-link" : "nav-link"}>
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function TopNav({ pathname }: { pathname: string }) {
  // Sau khi bấm một mục trong dropdown: chuột vẫn nằm trên menu và link vẫn giữ focus nên
  // dropdown (mở bằng :hover / :focus-within) không tự đóng -> tạm ẩn đến khi chuột rời khỏi mục.
  const [closed, setClosed] = useState<string | null>(null);
  const closeDropdown = (href: string) => {
    setClosed(href);
    (document.activeElement as HTMLElement | null)?.blur();
  };
  return (
    <nav id="navbar" className={pathname === "/medallium" ? "medallium-navigation" : "site-navigation"}>
      <div className="container">
        <ul className="navbar-content">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.href}
              className={item.children ? (closed === item.href ? "has-dropdown dropdown-closed" : "has-dropdown") : undefined}
              onMouseLeave={item.children && closed === item.href ? () => setClosed(null) : undefined}
            >
              <Link href={item.href} className={isActive(pathname, item.match) ? "active nav-link" : "nav-link"} aria-haspopup={item.children ? "true" : undefined}>
                {item.label}
                {item.children && (
                  <svg className="nav-caret" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Link>
              {item.children && (
                <ul className="nav-dropdown">
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} onClick={() => closeDropdown(item.href)} className={isChildActive(pathname, c.href) ? "active nav-link" : "nav-link"}>
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          <li className="navbar-theme">
            <ThemeToggle className="theme-toggle" />
          </li>
        </ul>
      </div>
    </nav>
  );
}

function LiveSidebarLinks({ onNavigate }: { onNavigate: () => void }) {
  return <SidebarLinks pathname={usePathname() || "/"} onNavigate={onNavigate} />;
}

function LiveTopNav() {
  return <TopNav pathname={usePathname() || "/"} />;
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  // khoá cuộn trang phía sau khi menu trượt đang mở
  useEffect(() => {
    document.documentElement.classList.toggle("site-menu-lock", open);
    return () => document.documentElement.classList.remove("site-menu-lock");
  }, [open]);

  return (
    <SidebarContext.Provider value={{ toggle }}>
      <div className="App">
        <div className={open ? "sidebar open" : "sidebar"}>
          <div className="sidebar-content-wrapper">
            <img alt="menu" className="img-menu img-content" src="/img/ui/menu/img-menu.webp" />
            <Suspense fallback={<SidebarLinks pathname="" onNavigate={close} />}>
              <LiveSidebarLinks onNavigate={close} />
            </Suspense>
            <ThemeToggle className="theme-toggle sidebar-theme" withText />
          </div>
        </div>
        <div className={open ? "bg-sidebar" : "bg-sidebar hidden"} onClick={close}></div>
        <Suspense fallback={<TopNav pathname="" />}>
          <LiveTopNav />
        </Suspense>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
