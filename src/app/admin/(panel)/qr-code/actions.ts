"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, int, json, refreshContent, slugify, str } from "@/lib/admin";

type Set = { name: string; slug: string; color: string; slides: string[] };

export async function saveQr(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(fd, "name");
  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    color: str(fd, "color"),
    icon: str(fd, "icon"),
    sortOrder: int(fd, "sortOrder"),
  };
  if (!data.name || !data.slug) return { error: "Cần nhập tên loại coin." };
  const sets = cleanRows(json<Set[]>(fd, "sets", []), "name").map((s, i) => ({
    ...s,
    slug: slugify(s.slug || s.name),
    color: s.color || data.color,
    sortOrder: i,
  }));
  const dup = sets.find((s, i) => sets.findIndex((x) => x.slug === s.slug) !== i);
  if (dup) return { error: `Slug bộ QR bị trùng: ${dup.slug}` };
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
    return { error: errorMessage(e) };
  }
  refreshContent();
  if (newId) redirect(`/admin/qr-code/${newId}`);
  return { ok: `Đã lưu “${data.name}” (${sets.length} bộ QR).` };
}

export async function deleteQr(id: number) {
  await requireAdmin();
  await prisma.qrCategory.delete({ where: { id } });
  refreshContent();
  redirect("/admin/qr-code");
}
