"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// Giống snippet gtag gốc: đẩy đối tượng `arguments` vào dataLayer (chạy được cả khi gtag.js chưa tải xong).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/** Gửi page_view cho lần tải đầu và mỗi lần chuyển trang phía client. */
export default function GaPageView({ id }: { id: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    // đợi một nhịp để <title> của trang mới kịp cập nhật
    const t = setTimeout(() => {
      gtag("event", "page_view", {
        send_to: id,
        page_path: pathname + (search ? `?${search}` : ""),
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 50);
    return () => clearTimeout(t);
  }, [id, pathname, search]);

  return null;
}
