"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, createContext, useCallback, useContext, useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";

const SidebarContext = createContext<{ toggle: () => void }>({ toggle: () => {} });
export const useSidebar = () => useContext(SidebarContext);

function isActive(pathname: string, match: string[]) {
  return match.some((m) =>
    m === "/" ? pathname === "/" : pathname === m || pathname.startsWith(m + "/") || pathname.startsWith(m + "-"),
  );
}

/** Danh sách link menu; `pathname` rỗng = chưa biết (lúc prerender) → không đánh dấu active. */
function SidebarLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <ul className="sidebar-content">
      {NAV_ITEMS.map((item) => (
        <li key={item.href} className={item.divider ? `sidebar-${item.href === "/" ? "home" : item.href.slice(1)}-link` : undefined}>
          <Link href={item.href} onClick={onNavigate} className={isActive(pathname, item.match) ? "active nav-link" : "nav-link"}>
            <img alt="icon" className="icon-menu" src={`/img/ui/menu/${item.icon}`} /> {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TopNav({ pathname }: { pathname: string }) {
  return (
    <nav id="navbar" className={pathname === "/medallium" ? "medallium-navigation" : "site-navigation"}>
      <div className="container">
        <ul className="navbar-content">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={isActive(pathname, item.match) ? "active nav-link" : "nav-link"}>
                {item.label}
              </Link>
            </li>
          ))}
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

  return (
    <SidebarContext.Provider value={{ toggle }}>
      <div className="App">
        <div className={open ? "sidebar open" : "sidebar"}>
          <div className="sidebar-content-wrapper">
            <img alt="menu" className="img-menu img-content" src="/img/ui/menu/img-menu.webp" />
            <Suspense fallback={<SidebarLinks pathname="" onNavigate={close} />}>
              <LiveSidebarLinks onNavigate={close} />
            </Suspense>
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
