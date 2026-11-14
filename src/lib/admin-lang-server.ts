import "server-only";
import { headers } from "next/headers";
import { ADMIN_LANG_COOKIE, type AdminLang, adminLocale, makeTr, parseAdminLang } from "./admin-lang";

/** Ngôn ngữ admin đang chọn – đọc cookie từ header (giống lib/auth.ts, tránh lỗi cookies() khi re-render sau server action). */
export async function getAdminLang(): Promise<AdminLang> {
  const raw = (await headers()).get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === ADMIN_LANG_COOKIE) return parseAdminLang(part.slice(i + 1).trim());
  }
  return "vi";
}

/** Hàm dịch cho trang / server action: const { tr, locale } = await getTr(); */
export async function getTr() {
  const lang = await getAdminLang();
  return { lang, tr: makeTr(lang), locale: adminLocale(lang) };
}
