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
  // Thu thanh xuống (chỉ còn "tai" nút) chứ không gỡ quảng cáo -> mở lại không phải tải lại banner.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("ad-bar-hidden", hidden);
  }, [hidden]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.innerHTML = code;
    el.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) s.setAttribute(attr.name, attr.value);
      s.text = old.text;
      old.replaceWith(s);
    });
    document.body.classList.add("has-ad-bar");

    // Thu nhỏ banner cho vừa khung (vd. 728×90 trên điện thoại) thay vì để bị cắt.
    // Thanh cao vừa khít banner: thu nhỏ theo chiều ngang (tối đa cao MAX_H), rồi đặt chiều cao khung
    // = chiều cao banner sau khi thu nhỏ (transform không làm đổi layout nên phải đặt tay).
    const MAX_H = 100;
    const viewport = el.parentElement!;
    const bar = viewport.parentElement!;
    const fit = () => {
      el.style.transform = "none";
      const w = el.scrollWidth;
      const h = el.scrollHeight;
      if (w && h) {
        const scale = Math.min(1, viewport.clientWidth / w, MAX_H / h);
        el.style.transform = scale < 1 ? `scale(${scale})` : "none";
        const want = `${Math.ceil(h * scale)}px`;
        if (viewport.style.height !== want) viewport.style.height = want;
      }
      // chừa đúng bằng chiều cao thanh ở cuối trang
      document.body.style.setProperty("--ad-bar-h", `${bar.offsetHeight}px`);
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
      document.body.classList.remove("has-ad-bar", "ad-bar-hidden");
      document.body.style.removeProperty("--ad-bar-h");
      el.innerHTML = "";
    };
  }, [code]);

  // Chỉ khi dev: đẩy nút DevTools "N" của Next.js lên trên thanh quảng cáo để không bị che.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    // chiều cao thanh (0 khi đang ẩn) + "tai" nút (24px) + khoảng cách 12px
    const barHeight = () => (hidden ? 0 : ((box.current?.closest(".ad-bar") as HTMLElement | null)?.offsetHeight ?? 100));
    return liftNextDevIndicator(() => barHeight() + 24 + 12);
  }, [hidden]);

  return (
    <div className={hidden ? "ad-bar is-hidden" : "ad-bar"} role="complementary" aria-label="Quảng cáo">
      <button
        type="button"
        className="ad-bar-close"
        aria-label={hidden ? "Hiện quảng cáo" : "Ẩn quảng cáo"}
        aria-expanded={!hidden}
        title={hidden ? "Hiện quảng cáo" : "Ẩn quảng cáo"}
        onClick={() => setHidden((h) => !h)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d={hidden ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="ad-bar-viewport">
        <div ref={box} className="ad-bar-content" />
      </div>
    </div>
  );
}
