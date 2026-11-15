"use client";
// Dữ liệu cá nhân của người xem lưu trong localStorage (không cần đăng nhập):
// QR đã quét, Yo-kai đã có / muốn săn... Mọi component dùng cùng key luôn đồng bộ
// (kể cả giữa các tab). Server render với giá trị rỗng -> không lệch hydrate.
import { useCallback, useSyncExternalStore } from "react";

const EVENT = "yd-local-store";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {}
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {}
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function useLocalJson<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const update = useCallback(
    (fn: (prev: T) => T) => {
      const next = fn(read(key, fallback));
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    // fallback là hằng số ở nơi gọi
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, update] as const;
}

// ---- QR đã quét: { "<coin>/<bộ>": [chỉ số slide] } ----
export type QrScanned = Record<string, number[]>;
const NO_QR: QrScanned = {};
export const useQrScanned = () => useLocalJson<QrScanned>("yd-qr-scanned", NO_QR);

// ---- Yo-kai của tôi: { "<game>": { "<slug>": "got" | "want" } } ----
export type YokaiMark = "got" | "want";
export type MyYokai = Record<string, Record<string, YokaiMark>>;
const NO_YOKAI: MyYokai = {};
export const useMyYokai = () => useLocalJson<MyYokai>("yd-my-yokai", NO_YOKAI);
