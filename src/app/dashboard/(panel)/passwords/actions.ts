"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, int, json, refreshContent, slugify, str } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";

type Row = { code: string; effect: string };

export async function saveRegion(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const data = {
    game: int(fd, "game"),
    code: slugify(str(fd, "code")),
    label: str(fd, "label"),
    color: str(fd, "color"),
    sortOrder: int(fd, "sortOrder"),
  };
  if (![1, 2, 3].includes(data.game) || !data.code || !data.label) return { error: tr("Cần chọn game, nhập mã vùng và nhãn.", "Please choose a game and enter a region code and label.") };
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
    return { error: await errorMessage(e) };
  }
  refreshContent();
  if (newId) redirect(`/dashboard/passwords/${newId}`);
  return { ok: tr(`Đã lưu ${rows.length} password.`, `Saved ${rows.length} passwords.`) };
}

export async function deleteRegion(id: number) {
  await requireAdmin();
  const r = await prisma.passwordRegion.delete({ where: { id } });
  refreshContent();
  redirect(`/dashboard/passwords?game=${r.game}`);
}
