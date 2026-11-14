"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, str } from "@/lib/admin";
import { SETTINGS_TAG } from "@/lib/settings";
import { getTr } from "@/lib/admin-lang-server";
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
  const { tr } = await getTr();
  const siteTitle = str(fd, "siteTitle") || DEFAULT_SETTINGS.siteTitle;
  if (siteTitle.length > 120) return { error: tr("Tiêu đề tối đa 120 ký tự.", "Title can be at most 120 characters.") };
  const lp = normalizeLoginPath(str(fd, "loginPath"), tr);
  if ("error" in lp) return { error: lp.error };
  const ga = normalizeGaId(str(fd, "gaId"), tr);
  if ("error" in ga) return { error: ga.error };
  const adCode = String(fd.get("adCode") ?? "").trim();
  if (adCode.length > 20000) return { error: tr("Mã quảng cáo tối đa 20.000 ký tự.", "Ad code can be at most 20,000 characters.") };
  const before = await readGeneralSettings();
  // chỉ cập nhật khi form có tab Quảng cáo (form cũ chưa có ô này thì giữ nguyên)
  const adblockWarning = fd.get("_ads") === "1" ? fd.get("adblockWarning") === "on" : before.adblockWarning;
  const site = fd.has("siteUrl") ? normalizeSiteUrl(str(fd, "siteUrl"), tr) : { url: before.siteUrl };
  if ("error" in site) return { error: site.error };
  // phần SEO chỉ cập nhật khi form có tab SEO (tránh form cũ đang mở ghi đè thành "tắt sitemap")
  const hasSeo = fd.get("_seo") === "1";
  const gsc = hasSeo ? normalizeGscCode(str(fd, "gscVerification"), tr) : { code: before.gscVerification };
  if ("error" in gsc) return { error: gsc.error };
  const allowed = new Set<string>(SITEMAP_SECTIONS.map((s) => s.id));
  const sitemapSections = hasSeo
    ? fd.getAll("sitemapSections").map(String).filter((s) => allowed.has(s))
    : before.sitemapSections;
  const sitemapEnabled = hasSeo ? fd.get("sitemapEnabled") === "on" : before.sitemapEnabled;
  if (sitemapEnabled && sitemapSections.length === 0) {
    return {
      error: tr(
        "Sitemap đang bật nhưng chưa chọn nhóm trang nào – hãy tick ít nhất 1 nhóm (tab SEO & Sitemap).",
        "The sitemap is on but no page group is selected – tick at least one group (SEO & Sitemap tab).",
      ),
    };
  }
  const value = {
    siteTitle,
    loginPath: lp.path,
    gaId: ga.id,
    adCode,
    adblockWarning,
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
        ? tr(`Đã lưu. Trang đăng nhập admin từ giờ là ${lp.path} – hãy ghi nhớ đường dẫn này.`, `Saved. The admin login page is now ${lp.path} – remember this path.`)
        : tr("Đã lưu cài đặt.", "Settings saved."),
  };
}
