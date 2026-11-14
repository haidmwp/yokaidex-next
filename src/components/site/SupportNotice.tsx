"use client";

import { useCallback, useEffect, useState } from "react";

/*
 * Phát hiện trình chặn quảng cáo (AdBlock, uBlock Origin, AdGuard, Brave Shields…) và hiện popup
 * che trang. Popup không có nút đóng: người xem phải tắt trình chặn cho website rồi bấm kiểm tra lại.
 *
 * Tên file / class cố ý không chứa chữ "adblock" để bộ lọc chống-anti-adblock không ẩn mất popup.
 */

/** URL script quảng cáo đầu tiên trong mã quảng cáo (vd. Adsterra), dùng để thử tải. */
function probeUrl(code: string) {
  const src = code.match(/<script[^>]+src=["']([^"']+)["']/i)?.[1];
  if (src) return src.startsWith("//") ? `https:${src}` : src;
  return "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
}

/** 1) Mồi: khối mang class quảng cáo phổ biến – bộ lọc giao diện sẽ ẩn nó. */
function baitBlocked(): Promise<boolean> {
  return new Promise((resolve) => {
    const bait = document.createElement("div");
    bait.className = "adsbox ad-banner ad-placement pub_300x250 pub_728x90 textads banner-ads sponsor-ads";
    bait.setAttribute("aria-hidden", "true");
    bait.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;pointer-events:none;";
    bait.innerHTML = "&nbsp;";
    document.body.appendChild(bait);
    setTimeout(() => {
      const cs = getComputedStyle(bait);
      const blocked =
        !bait.isConnected || bait.offsetHeight === 0 || bait.offsetParent === null || cs.display === "none" || cs.visibility === "hidden";
      bait.remove();
      resolve(blocked);
    }, 150);
  });
}

/** 2) Mạng: thử tải script của mạng quảng cáo – trình chặn sẽ huỷ request. */
async function requestBlocked(url: string): Promise<boolean> {
  if (!navigator.onLine) return false; // mất mạng không tính là chặn quảng cáo
  try {
    await fetch(url, { mode: "no-cors", cache: "no-store" });
    return false;
  } catch {
    return true;
  }
}

/** 3) Thanh quảng cáo bị ẩn bằng CSS (không phải do người xem bấm thu gọn). */
function barHidden() {
  const bar = document.querySelector<HTMLElement>(".ad-bar");
  if (!bar || bar.classList.contains("is-hidden")) return false;
  return bar.offsetHeight === 0 || getComputedStyle(bar).display === "none";
}

/** Trả về danh sách dấu hiệu bị chặn (rỗng = không chặn): B = mồi bị ẩn, N = request bị huỷ, H = thanh bị ẩn. */
async function detect(code: string) {
  const [bait, probe] = await Promise.all([baitBlocked(), requestBlocked(probeUrl(code))]);
  // Banner thật đã hiện (iframe của mạng quảng cáo) thì request thử bị lỗi không tính là bị chặn.
  const req = probe && !document.querySelector(".ad-bar-content iframe");
  const reasons = [bait && "B", req && "N", barHidden() && "H"].filter(Boolean) as string[];
  if (reasons.length) console.info("[YokaiDex] ad blocker check:", { bait, request: req, barHidden: reasons.includes("H") });
  return reasons;
}

// Bấm "đã tắt" -> tải lại trang rồi kiểm tra lại (CSS ẩn quảng cáo mà extension đã chèn chỉ mất khi tải lại).
const RECHECK_KEY = "yd-shield-recheck";
const readRecheck = () => {
  try {
    const v = sessionStorage.getItem(RECHECK_KEY) === "1";
    sessionStorage.removeItem(RECHECK_KEY);
    return v;
  } catch {
    return false;
  }
};

export default function SupportNotice({ code }: { code: string }) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [stillBlocked, setStillBlocked] = useState(false);
  const blocked = reasons.length > 0;

  useEffect(() => {
    let alive = true;
    const isRecheck = readRecheck();
    // đợi trang + quảng cáo tải xong rồi mới kiểm tra
    const t = setTimeout(async () => {
      const r = await detect(code);
      if (!alive) return;
      setReasons(r);
      setStillBlocked(isRecheck && r.length > 0);
    }, 2500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [code]);

  // khoá cuộn trang khi popup đang hiện
  useEffect(() => {
    document.documentElement.classList.toggle("yd-shield-lock", blocked);
    return () => document.documentElement.classList.remove("yd-shield-lock");
  }, [blocked]);

  const recheck = useCallback(() => {
    setChecking(true);
    try {
      sessionStorage.setItem(RECHECK_KEY, "1");
    } catch {}
    window.location.reload();
  }, []);

  if (!blocked) return null;
  return (
    <div className="yd-shield" role="dialog" aria-modal="true" aria-labelledby="yd-shield-title">
      <div className="yd-shield-box">
        <div className="yd-shield-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40">
            <path
              d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 id="yd-shield-title">Ad blocker detected</h2>
        <p>
          YokaiDex is free and kept running by ads. Please disable your ad blocker (AdBlock, uBlock Origin, AdGuard, Brave Shields…) for{" "}
          <b>this website</b>, then press the button below.
        </p>
        <ol>
          <li>Click the ad blocker icon in your browser toolbar.</li>
          <li>Choose &quot;Pause on this site&quot; / &quot;Don&apos;t run on this site&quot;.</li>
          <li>Press &quot;I&apos;ve disabled it&quot;.</li>
        </ol>
        {stillBlocked && (
          <p className="yd-shield-error">
            Ads are still being blocked. Please disable every ad blocker for this site (also check your browser&apos;s built-in tracking
            protection) and try again.
          </p>
        )}
        <button type="button" className="yd-shield-btn" onClick={recheck} disabled={checking}>
          {checking ? "Checking…" : "I've disabled it"}
        </button>
        {reasons.includes("N") && !reasons.includes("B") && (
          <p className="yd-shield-hint">
            Firefox: click the shield icon in the address bar and turn off <b>Enhanced Tracking Protection</b> for this site. Brave: turn off
            Shields for this site.
          </p>
        )}
        <p className="yd-shield-code">Code: {reasons.join("")}</p>
      </div>
    </div>
  );
}
