"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, int, json, refreshContent, slugify, str } from "@/lib/admin";

type Row = { code: string; effect: string };

export async function saveRegion(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const data = {
    game: int(fd, "game"),
    code: slugify(str(fd, "code")),
    label: str(fd, "label"),
    color: str(fd, "color"),
    sortOrder: int(fd, "sortOrder"),
  };
  if (![1, 2, 3].includes(data.game) || !data.code || !data.label) return { error: "Cần chọn game, nhập mã vùng và nhãn." };
  const rows = cleanRows(json<Row[]>(fd, "passwords", []), "code").map((r, i) => ({ ...r, sortOrder: i }));
  let newId: number | null = null;
  try {
    if (id) {
      await prisma.$transaction([
        prisma.passwordRegion.update({ where: { id }, data }),
        prisma.password.deleteMany({ where: { regionId: id } }),
        prisma.password.createMany({ data: rows.map((r) => ({ ...r, regionId: id })) }),
      ]);
    } else {
      const r = await prisma.passwordRegion.create({ data: { ...data, passwords: { create: rows } } });
      newId = r.id;
    }
  } catch (e) {
    return { error: errorMessage(e) };
  }
  refreshContent();
  if (newId) redirect(`/admin/passwords/${newId}`);
  return { ok: `Đã lưu ${rows.length} password.` };
}

export async function deleteRegion(id: number) {
  await requireAdmin();
  await prisma.passwordRegion.delete({ where: { id } });
  refreshContent();
  redirect("/admin/passwords");
}
