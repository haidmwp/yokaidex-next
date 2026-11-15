"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEYS } from "./ThemeScript";

/*
 * Nút chuyển chế độ sáng / tối. Website và trang quản trị lưu lựa chọn riêng (storageKey).
 * Theme ban đầu do components/ThemeScript.tsx đặt khi trang tải.
 */
type Theme = "light" | "dark";

const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

function apply(t: Theme, storageKey: string) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(storageKey, t);
  } catch {}
}

export default function ThemeToggle({
  className,
  labels,
  withText,
  storageKey = THEME_KEYS.site,
}: {
  className?: string;
  /** khoá localStorage: THEME_KEYS.site (mặc định) hoặc THEME_KEYS.admin */
  storageKey?: string;
  labels?: { light: string; dark: string };
  /** hiện chữ cạnh icon (vd. trong menu mobile) */
  withText?: boolean;
}) {
  const theme = useSyncExternalStore<Theme | null>(subscribe, read, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? (labels?.dark ?? "Dark mode") : (labels?.light ?? "Light mode");
  return (
    <button type="button" className={className ?? "theme-toggle"} onClick={() => apply(next, storageKey)} aria-label={label} title={label}>
      {theme === "dark" ? (
        // mặt trời: đang tối -> bấm để sáng
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        // mặt trăng: đang sáng -> bấm để tối
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
      {withText && <span>{label}</span>}
    </button>
  );
}
