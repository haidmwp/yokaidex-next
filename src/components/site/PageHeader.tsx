"use client";

import { useRouter } from "next/navigation";
import { useSidebar } from "./SiteShell";

type Props = { title: string; color: string; home?: boolean };

/** Thanh tiêu đề cố định của mỗi trang (nút back – tiêu đề – nút mở menu). */
export default function PageHeader({ title, color, home }: Props) {
  const router = useRouter();
  const { toggle } = useSidebar();
  return (
    <div className="header-wrapper">
      <div className="container">
        <div className="header-content" style={{ backgroundColor: color }}>
          <div className="header-title-wrapper">
            {home ? (
              <span className="menu-back">
                <img alt="logo" className="icon-back" src="/img/ui/icon-logo.webp" />
              </span>
            ) : (
              <span onClick={() => router.back()} className="menu-back">
                <img alt="back" className="icon-back" src="/img/ui/menu/icon-back.svg" />
              </span>
            )}
            <h1 className="header-title">{title}</h1>
            <span onClick={toggle} className="menu-toggle">
              <img alt="navbar" className="icon-navbar" src="/img/ui/menu/icon-navbar.svg" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
