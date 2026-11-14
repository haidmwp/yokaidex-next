"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, int, json, refreshContent, slugify, str } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";

type Set = { name: string; slug: string; color: string; slides: string[] };

export async function saveQr(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const name = str(fd, "name");
  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    color: str(fd, "color"),
    icon: str(fd, "icon"),
    sortOrder: int(fd, "sortOrder"),
  };
  if (!data.name || !data.slug) return { error: tr("Cần nhập tên loại coin.", "Please enter a coin type name.") };
  const sets = cleanRows(json<Set[]>(fd, "sets", []), "name").map((s, i) => ({
    ...s,
    slug: slugify(s.slug || s.name),
    color: s.color || data.color,
    sortOrder: i,
  }));
  const dup = sets.find((s, i) => sets.findIndex((x) => x.slug === s.slug) !== i);
  if (dup) return { error: tr(`Slug bộ QR bị trùng: ${dup.slug}`, `Duplicate QR set slug: ${dup.slug}`) };
  let newId: number | null = null;
  try {
    if (id) {
      await prisma.$transaction([
        prisma.qrCategory.update({ where: { id }, data }),
        prisma.qrSet.deleteMany({ where: { categoryId: id } }),
        ...sets.map((s) => prisma.qrSet.create({ data: { ...s, categoryId: id } })),
      ]);
    } else {
      const c = await prisma.qrCategory.create({ data: { ...data, sets: { create: sets } } });
      newId = c.id;
    }
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  refreshContent();
  if (newId) redirect(`/dashboard/qr-code/${newId}`);
  return { ok: tr(`Đã lưu “${data.name}” (${sets.length} bộ QR).`, `Saved “${data.name}” (${sets.length} QR sets).`) };
}

export async function deleteQr(id: number) {
  await requireAdmin();
  await prisma.qrCategory.delete({ where: { id } });
  refreshContent();
  redirect("/dashboard/qr-code");
}
