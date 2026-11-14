// Cài đặt chung (bảng Setting, key "general") – phần KHÔNG dùng cache, an toàn cho proxy.
import { prisma } from "./prisma";
import { SITE_NAME, SITE_TAGLINE } from "./constants";
import { type Tr, makeTr } from "./admin-lang";

const VI: Tr = makeTr("vi");

export type GeneralSettings = {
  /** Tiêu đề website trên tab trình duyệt (trang chủ hiện đúng chuỗi này, trang con: "Tên trang | <tiêu đề>") */
  siteTitle: string;
  /** Đường dẫn trang đăng nhập admin (1 cấp), vd "/dashboard" hoặc "/quan-tri-bi-mat" */
  loginPath: string;
  /** Google Analytics 4 Measurement ID (G-XXXXXXX). Rỗng = tắt GA. */
  gaId: string;
  /** Mã quảng cáo (HTML/script, vd. AdSense). Rỗng = không hiện thanh quảng cáo. */
  adCode: string;
  /** Hiện popup cảnh báo khi người xem bật trình chặn quảng cáo (chỉ khi có mã quảng cáo) */
  adblockWarning: boolean;
  /** Địa chỉ gốc của website (dùng cho sitemap, robots, link chia sẻ), vd https://yokaidex.com */
  siteUrl: string;
  /** Bật /sitemap.xml */
  sitemapEnabled: boolean;
  /** Các nhóm trang đưa vào sitemap (xem SITEMAP_SECTIONS) */
  sitemapSections: string[];
  /** Mã xác minh Google Search Console (nội dung thẻ meta google-site-verification) */
  gscVerification: string;
};

/** Các nhóm trang có thể đưa vào sitemap. */
export const SITEMAP_SECTIONS = [
  { id: "pages", label: "Trang chính (Home, Medallium, Food, QR Code, Baffle Board, Password…)", labelEn: "Main pages (Home, Medallium, Food, QR Code, Baffle Board, Password…)" },
  { id: "yw1", label: "Yo-kai Watch 1 – trang chi tiết yo-kai", labelEn: "Yo-kai Watch 1 – yo-kai detail pages" },
  { id: "yw2", label: "Yo-kai Watch 2 – trang chi tiết yo-kai", labelEn: "Yo-kai Watch 2 – yo-kai detail pages" },
  { id: "yw3", label: "Yo-kai Watch 3 – trang chi tiết yo-kai", labelEn: "Yo-kai Watch 3 – yo-kai detail pages" },
  { id: "food", label: "Food – từng nhóm món ăn", labelEn: "Food – each food group" },
  { id: "qr", label: "QR Code – từng loại coin và bộ QR", labelEn: "QR Code – each coin type and QR set" },
  { id: "password", label: "Password – từng vùng/ngôn ngữ", labelEn: "Password – each region/language" },
] as const;

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
  adCode: "",
  adblockWarning: true,
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://yokaidex.com").replace(/\/+$/, ""),
  sitemapEnabled: true,
  sitemapSections: SITEMAP_SECTIONS.map((s) => s.id),
  gscVerification: "",
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
    adCode: (v.adCode ?? "").trim(),
    adblockWarning: v.adblockWarning ?? DEFAULT_SETTINGS.adblockWarning,
    siteUrl: (v.siteUrl?.trim() || DEFAULT_SETTINGS.siteUrl).replace(/\/+$/, ""),
    sitemapEnabled: v.sitemapEnabled ?? DEFAULT_SETTINGS.sitemapEnabled,
    sitemapSections: Array.isArray(v.sitemapSections) ? v.sitemapSections : DEFAULT_SETTINGS.sitemapSections,
    gscVerification: (v.gscVerification ?? "").trim(),
  };
}

/** Kiểm tra địa chỉ website (http/https, không có đường dẫn con). */
export function normalizeSiteUrl(input: string, tr: Tr = VI): { url: string } | { error: string } {
  const raw = input.trim() || DEFAULT_SETTINGS.siteUrl;
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) throw new Error();
    return { url: `${u.protocol}//${u.host}` };
  } catch {
    return { error: tr("Địa chỉ website không hợp lệ, vd: https://yokaidex.com", "Invalid website URL, e.g. https://yokaidex.com") };
  }
}

/**
 * Mã xác minh Search Console: chấp nhận dán cả thẻ <meta name="google-site-verification" content="..."> hoặc chỉ phần mã.
 */
export function normalizeGscCode(input: string, tr: Tr = VI): { code: string } | { error: string } {
  let v = input.trim();
  const m = v.match(/content\s*=\s*["']([^"']+)["']/i);
  if (m) v = m[1].trim();
  if (!v) return { code: "" };
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(v)) return { error: tr("Mã xác minh Search Console không hợp lệ.", "Invalid Search Console verification code.") };
  return { code: v };
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
export function normalizeLoginPath(input: string, tr: Tr = VI): { path: string } | { error: string } {
  let p = input.trim().toLowerCase();
  if (!p) return { path: DEFAULT_LOGIN_PATH };
  if (!p.startsWith("/")) p = "/" + p;
  p = p.replace(/\/+$/, "");
  if (p === DEFAULT_LOGIN_PATH) return { path: p };
  if (!/^\/[a-z0-9][a-z0-9-]{3,48}$/.test(p)) {
    return {
      error: tr(
        "Đường dẫn chỉ gồm 1 cấp, 4–49 ký tự: chữ thường, số, gạch ngang. Vd: /quan-tri-yokaidex",
        "The path must be one level, 4–49 characters: lowercase letters, digits, hyphens. E.g. /yokaidex-manager",
      ),
    };
  }
  if (p.startsWith(ADMIN_BASE) || RESERVED.some((r) => p === r || p.startsWith(r + "-") || p.startsWith(r + "/"))) {
    return { error: tr(`Đường dẫn "${p}" trùng với một trang có sẵn của website.`, `The path "${p}" conflicts with an existing page of the website.`) };
  }
  return { path: p };
}

/** Kiểm tra Measurement ID GA4. Rỗng = tắt. */
export function normalizeGaId(input: string, tr: Tr = VI): { id: string } | { error: string } {
  const id = input.trim().toUpperCase();
  if (!id) return { id: "" };
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) return { error: tr("Mã Google Analytics phải có dạng G-XXXXXXXXXX (GA4 Measurement ID).", "The Google Analytics ID must look like G-XXXXXXXXXX (GA4 Measurement ID).") };
  return { id };
}
