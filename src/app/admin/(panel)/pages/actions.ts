"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, json, refreshContent, str } from "@/lib/admin";

export async function savePage(id: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const data = {
    title: str(fd, "title"),
    color: str(fd, "color"),
    description: str(fd, "description"),
    content: String(fd.get("content") ?? ""),
  };
  if (!data.title) return { error: "Cần nhập tiêu đề." };
  try {
    await prisma.page.update({ where: { id }, data });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  refreshContent();
  return { ok: "Đã lưu trang." };
}

/** Lưu khối "Follow us" (mạng xã hội) – tách riêng khỏi nội dung trang. */
export async function saveSocials(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const links = cleanRows(json<{ name: string; url: string; icon: string }[]>(fd, "links", []), "url");
  const bad = links.find((l) => !/^https?:\/\//.test(l.url));
  if (bad) return { error: `Link không hợp lệ: ${bad.url} (phải bắt đầu bằng http:// hoặc https://)` };
  const value = { title: str(fd, "title") || "Follow us on:", links };
  try {
    await prisma.setting.upsert({ where: { key: "socials" }, create: { key: "socials", value }, update: { value } });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  refreshContent();
  return { ok: `Đã lưu ${links.length} mạng xã hội.` };
}
