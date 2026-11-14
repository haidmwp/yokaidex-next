"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, str } from "@/lib/admin";
import { SETTINGS_TAG } from "@/lib/settings";
import { DEFAULT_SETTINGS, clearLoginPathCache, normalizeGaId, normalizeLoginPath, readGeneralSettings } from "@/lib/settings-store";

export async function saveGeneralSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const siteTitle = str(fd, "siteTitle") || DEFAULT_SETTINGS.siteTitle;
  if (siteTitle.length > 120) return { error: "Tiêu đề tối đa 120 ký tự." };
  const lp = normalizeLoginPath(str(fd, "loginPath"));
  if ("error" in lp) return { error: lp.error };
  const ga = normalizeGaId(str(fd, "gaId"));
  if ("error" in ga) return { error: ga.error };

  const before = await readGeneralSettings();
  const value = { siteTitle, loginPath: lp.path, gaId: ga.id };
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
