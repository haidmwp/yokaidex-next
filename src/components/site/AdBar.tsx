"use client";

import { useEffect, useRef, useState } from "react";

/**
 * (dev) Nút DevTools của Next.js nằm trong shadow DOM, vị trí đặt bằng inline style `bottom`.
 * Đặt lại `bottom` và giữ nguyên nếu Next.js vẽ lại; trả về hàm khôi phục.
 */
function liftNextDevIndicator(offset: () => number) {
  let observer: MutationObserver | null = null;
  let resize: ResizeObserver | null = null;
  let original: string | null = null;
  let el: HTMLElement | null = null;
  const apply = () => {
    if (!el) return;
    const want = `${offset()}px`;
    if (el.style.bottom !== want) el.style.bottom = want;
  };
  const find = () => {
    el = document.querySelector("nextjs-portal")?.shadowRoot?.getElementById("devtools-indicator") ?? null;
    if (!el) return false;
    original = el.style.bottom;
    apply();
    observer = new MutationObserver(apply);
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    // quảng cáo thật (AdSense…) tải chậm làm thanh cao lên -> tính lại vị trí
    const bar = document.querySelector(".ad-bar");
    if (bar) {
      resize = new ResizeObserver(apply);
      resize.observe(bar);
    }
    return true;
  };
  // portal có thể xuất hiện sau khi trang tải xong
  const timer = find() ? null : setInterval(() => find() && timer && clearInterval(timer), 500);
  return () => {
    if (timer) clearInterval(timer);
    observer?.disconnect();
    resize?.disconnect();
    if (el && original !== null) el.style.bottom = original;
  };
}

/**
 * Thanh quảng cáo cố định dưới chân trang. Chèn mã HTML từ Cài đặt chung và cho chạy lại
 * các thẻ <script> (gán innerHTML thì trình duyệt không chạy script, nên phải tạo lại từng thẻ).
 * Nằm trong layout nên không bị tải lại khi chuyển trang phía client.
 */
export default function AdBar({ code }: { code: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || closed) return;
    el.innerHTML = code;
    el.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) s.setAttribute(attr.name, attr.value);
      s.text = old.text;
      old.replaceWith(s);
    });
    document.body.classList.add("has-ad-bar");

    // Thu nhỏ banner cho vừa khung (vd. 728×90 trên điện thoại) thay vì để bị cắt.
    const viewport = el.parentElement!;
    const fit = () => {
      el.style.transform = "none";
      const w = el.scrollWidth;
      const h = el.scrollHeight;
      if (!w || !h) return;
      const scale = Math.min(1, viewport.clientWidth / w, viewport.clientHeight / h);
      el.style.transform = scale < 1 ? `scale(${scale})` : "none";
    };
    const ro = new ResizeObserver(fit);
    ro.observe(viewport);
    ro.observe(el);
    // iframe quảng cáo thường được chèn sau -> theo dõi thay đổi bên trong
    const mo = new MutationObserver(() => {
      fit();
      el.querySelectorAll("iframe, img, ins, div").forEach((c) => ro.observe(c));
    });
    mo.observe(el, { childList: true, subtree: true });
    fit();

    return () => {
      ro.disconnect();
      mo.disconnect();
      document.body.classList.remove("has-ad-bar");
      el.innerHTML = "";
    };
  }, [code, closed]);

  // Chỉ khi dev: đẩy nút DevTools "N" của Next.js lên trên thanh quảng cáo để không bị che.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || closed) return;
    // chiều cao thanh + "tai" nút đóng (24px) + khoảng cách 12px
    return liftNextDevIndicator(() => ((box.current?.closest(".ad-bar") as HTMLElement | null)?.offsetHeight ?? 100) + 24 + 12);
  }, [closed]);

  if (closed) return null;
  return (
    <div className="ad-bar" role="complementary" aria-label="Quảng cáo">
      <button type="button" className="ad-bar-close" aria-label="Đóng quảng cáo" onClick={() => setClosed(true)}>
        ×
      </button>
      <div className="ad-bar-viewport">
        <div ref={box} className="ad-bar-content" />
      </div>
    </div>
  );
}
