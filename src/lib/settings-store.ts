// Cài đặt chung (bảng Setting, key "general") – phần KHÔNG dùng cache, an toàn cho proxy.
import { prisma } from "./prisma";
import { SITE_NAME, SITE_TAGLINE } from "./constants";

export type GeneralSettings = {
  /** Tiêu đề website trên tab trình duyệt (trang chủ hiện đúng chuỗi này, trang con: "Tên trang | <tiêu đề>") */
  siteTitle: string;
  /** Đường dẫn trang đăng nhập admin (1 cấp), vd "/dashboard" hoặc "/quan-tri-bi-mat" */
  loginPath: string;
  /** Google Analytics 4 Measurement ID (G-XXXXXXX). Rỗng = tắt GA. */
  gaId: string;
};

/** Khu quản trị luôn nằm ở /dashboard/..., bất kể đường dẫn đăng nhập. */
export const ADMIN_BASE = "/dashboard";
/** Đường dẫn đăng nhập mặc định: chính /dashboard (chưa đăng nhập thì hiện form). */
export const DEFAULT_LOGIN_PATH = ADMIN_BASE;
/** Route nội bộ của trang đăng nhập – chỉ truy cập qua rewrite của proxy, gõ trực tiếp sẽ 404. */
export const LOGIN_ROUTE = "/dashboard/login";

export const DEFAULT_SETTINGS: GeneralSettings = {
  siteTitle: `${SITE_NAME} ${SITE_TAGLINE}`,
  loginPath: DEFAULT_LOGIN_PATH,
  gaId: "",
};

/** Đọc thẳng từ DB (không cache) – dùng cho proxy / server action. */
export async function readGeneralSettings(): Promise<GeneralSettings> {
  const row = await prisma.setting.findUnique({ where: { key: "general" } });
  const v = (row?.value ?? {}) as Partial<GeneralSettings>;
  const lp = v.loginPath?.trim();
  return {
    siteTitle: v.siteTitle?.trim() || DEFAULT_SETTINGS.siteTitle,
    // giá trị cũ "/admin/login" (trước khi đổi sang /dashboard) coi như mặc định
    loginPath: lp && lp !== "/admin/login" ? lp : DEFAULT_LOGIN_PATH,
    // chưa từng lưu trong admin -> dùng NEXT_PUBLIC_GA_ID trong .env; đã lưu rỗng -> tắt
    gaId: (v.gaId ?? process.env.NEXT_PUBLIC_GA_ID ?? "").trim(),
  };
}

// Proxy chạy ở mọi request -> nhớ tạm đường dẫn đăng nhập vài giây thay vì hỏi DB mỗi lần.
let loginPathCache: { value: string; at: number } | null = null;
export async function getLoginPath(): Promise<string> {
  if (loginPathCache && Date.now() - loginPathCache.at < 5000) return loginPathCache.value;
  const value = (await readGeneralSettings()).loginPath;
  loginPathCache = { value, at: Date.now() };
  return value;
}
export function clearLoginPathCache() {
  loginPathCache = null;
}

/** Các tiền tố URL đã dùng, không cho đặt làm đường dẫn đăng nhập. */
const RESERVED = [
  "/admin", "/api", "/_next", "/img", "/fonts", "/uploads", "/medallium", "/yokai-watch", "/yokai-information", "/qr-code",
  "/baffle-board", "/attitudes", "/password", "/rare-special-soul", "/food", "/contact", "/privacy-policy", "/changelog",
];

/** Chuẩn hoá & kiểm tra đường dẫn đăng nhập (chỉ 1 cấp). Trả về path hợp lệ hoặc thông báo lỗi. */
export function normalizeLoginPath(input: string): { path: string } | { error: string } {
  let p = input.trim().toLowerCase();
  if (!p) return { path: DEFAULT_LOGIN_PATH };
  if (!p.startsWith("/")) p = "/" + p;
  p = p.replace(/\/+$/, "");
  if (p === DEFAULT_LOGIN_PATH) return { path: p };
  if (!/^\/[a-z0-9][a-z0-9-]{3,48}$/.test(p)) {
    return { error: "Đường dẫn chỉ gồm 1 cấp, 4–49 ký tự: chữ thường, số, gạch ngang. Vd: /quan-tri-yokaidex" };
  }
  if (p.startsWith(ADMIN_BASE) || RESERVED.some((r) => p === r || p.startsWith(r + "-") || p.startsWith(r + "/"))) {
    return { error: `Đường dẫn "${p}" trùng với một trang có sẵn của website.` };
  }
  return { path: p };
}

/** Kiểm tra Measurement ID GA4. Rỗng = tắt. */
export function normalizeGaId(input: string): { id: string } | { error: string } {
  const id = input.trim().toUpperCase();
  if (!id) return { id: "" };
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) return { error: "Mã Google Analytics phải có dạng G-XXXXXXXXXX (GA4 Measurement ID)." };
  return { id };
}
