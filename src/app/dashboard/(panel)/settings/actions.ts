"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, str } from "@/lib/admin";
import { SETTINGS_TAG } from "@/lib/settings";
import {
  DEFAULT_SETTINGS,
  SITEMAP_SECTIONS,
  clearLoginPathCache,
  normalizeGaId,
  normalizeGscCode,
  normalizeLoginPath,
  normalizeSiteUrl,
  readGeneralSettings,
} from "@/lib/settings-store";

export async function saveGeneralSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const siteTitle = str(fd, "siteTitle") || DEFAULT_SETTINGS.siteTitle;
  if (siteTitle.length > 120) return { error: "Tiêu đề tối đa 120 ký tự." };
  const lp = normalizeLoginPath(str(fd, "loginPath"));
  if ("error" in lp) return { error: lp.error };
  const ga = normalizeGaId(str(fd, "gaId"));
  if ("error" in ga) return { error: ga.error };
  const adCode = String(fd.get("adCode") ?? "").trim();
  if (adCode.length > 20000) return { error: "Mã quảng cáo tối đa 20.000 ký tự." };
  const before = await readGeneralSettings();
  const site = fd.has("siteUrl") ? normalizeSiteUrl(str(fd, "siteUrl")) : { url: before.siteUrl };
  if ("error" in site) return { error: site.error };
  // phần SEO chỉ cập nhật khi form có tab SEO (tránh form cũ đang mở ghi đè thành "tắt sitemap")
  const hasSeo = fd.get("_seo") === "1";
  const gsc = hasSeo ? normalizeGscCode(str(fd, "gscVerification")) : { code: before.gscVerification };
  if ("error" in gsc) return { error: gsc.error };
  const allowed = new Set<string>(SITEMAP_SECTIONS.map((s) => s.id));
  const sitemapSections = hasSeo
    ? fd.getAll("sitemapSections").map(String).filter((s) => allowed.has(s))
    : before.sitemapSections;
  const sitemapEnabled = hasSeo ? fd.get("sitemapEnabled") === "on" : before.sitemapEnabled;
  if (sitemapEnabled && sitemapSections.length === 0) {
    return { error: "Sitemap đang bật nhưng chưa chọn nhóm trang nào – hãy tick ít nhất 1 nhóm (tab SEO & Sitemap)." };
  }
  const value = {
    siteTitle,
    loginPath: lp.path,
    gaId: ga.id,
    adCode,
    siteUrl: site.url,
    sitemapEnabled,
    sitemapSections,
    gscVerification: gsc.code,
  };
  await prisma.setting.upsert({ where: { key: "general" }, create: { key: "general", value }, update: { value } });
  clearLoginPathCache();
  updateTag(SETTINGS_TAG);

  return {
    ok:
      before.loginPath !== lp.path
        ? `Đã lưu. Trang đăng nhập admin từ giờ là ${lp.path} – hãy ghi nhớ đường dẫn này.`
        : "Đã lưu cài đặt.",
  };
}
