// Ngôn ngữ giao diện admin (Việt / Anh). Dùng chung cho server và client.
// Mỗi chuỗi viết song ngữ ngay tại chỗ: tr("Lưu", "Save").

export type AdminLang = "vi" | "en";
export const ADMIN_LANGS: { id: AdminLang; label: string }[] = [
  { id: "vi", label: "VI" },
  { id: "en", label: "EN" },
];
export const ADMIN_LANG_COOKIE = "yokaidex_admin_lang";

export type Tr = (vi: string, en: string) => string;
export const makeTr =
  (lang: AdminLang): Tr =>
  (vi, en) =>
    lang === "en" ? en : vi;

/** Locale để định dạng số / ngày giờ theo ngôn ngữ đang chọn. */
export const adminLocale = (lang: AdminLang) => (lang === "en" ? "en-GB" : "vi-VN");

export const parseAdminLang = (v?: string | null): AdminLang => (v === "en" ? "en" : "vi");
