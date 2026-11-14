"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, errorMessage, refreshContent, str } from "@/lib/admin";

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
