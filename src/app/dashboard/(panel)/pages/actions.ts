"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, json, refreshContent, str } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";

export async function savePage(id: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const data = {
    title: str(fd, "title"),
    color: str(fd, "color"),
    description: str(fd, "description"),
    content: String(fd.get("content") ?? ""),
  };
  if (!data.title) return { error: tr("Cần nhập tiêu đề.", "Please enter a title.") };
  try {
    await prisma.page.update({ where: { id }, data });
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  refreshContent();
  return { ok: tr("Đã lưu trang.", "Page saved.") };
}

/** Lưu khối "Follow us" (mạng xã hội) – tách riêng khỏi nội dung trang. */
export async function saveSocials(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const links = cleanRows(json<{ name: string; url: string; icon: string }[]>(fd, "links", []), "url");
  const bad = links.find((l) => !/^https?:\/\//.test(l.url));
  if (bad)
    return {
      error: tr(
        `Link không hợp lệ: ${bad.url} (phải bắt đầu bằng http:// hoặc https://)`,
        `Invalid link: ${bad.url} (must start with http:// or https://)`,
      ),
    };
  const value = { title: str(fd, "title") || "Follow us on:", links };
  try {
    await prisma.setting.upsert({ where: { key: "socials" }, create: { key: "socials", value }, update: { value } });
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  refreshContent();
  return { ok: tr(`Đã lưu ${links.length} mạng xã hội.`, `Saved ${links.length} social networks.`) };
}
