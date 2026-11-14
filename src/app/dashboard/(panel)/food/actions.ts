"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, int, json, refreshContent, slugify, str } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";

type Item = { name: string; image: string; onFriend: string; onFoe: string };

export async function saveFood(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const name = str(fd, "name");
  const data = {
    name,
    slug: slugify(str(fd, "slug") || name),
    color: str(fd, "color"),
    image: str(fd, "image"),
    sortOrder: int(fd, "sortOrder"),
  };
  if (!data.name || !data.slug) return { error: tr("Cần nhập tên nhóm.", "Please enter a group name.") };
  const items = cleanRows(json<Item[]>(fd, "items", []), "name").map((it, i) => ({ ...it, sortOrder: i }));
  let newId: number | null = null;
  try {
    if (id) {
      const old = await prisma.foodCategory.findUnique({ where: { id }, select: { slug: true } });
      await prisma.$transaction([
        prisma.foodCategory.update({ where: { id }, data }),
        prisma.foodItem.deleteMany({ where: { categoryId: id } }),
        prisma.foodItem.createMany({ data: items.map((it) => ({ ...it, categoryId: id })) }),
        // giữ liên kết món ăn yêu thích của yokai khi đổi slug
        ...(old && old.slug !== data.slug
          ? [prisma.yokai.updateMany({ where: { foodSlug: old.slug }, data: { foodSlug: data.slug } })]
          : []),
      ]);
    } else {
      const c = await prisma.foodCategory.create({ data: { ...data, items: { create: items } } });
      newId = c.id;
    }
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  refreshContent();
  if (newId) redirect(`/dashboard/food/${newId}`);
  return { ok: tr(`Đã lưu nhóm “${data.name}” (${items.length} món).`, `Saved group “${data.name}” (${items.length} items).`) };
}

export async function deleteFood(id: number) {
  await requireAdmin();
  await prisma.foodCategory.delete({ where: { id } });
  refreshContent();
  redirect("/dashboard/food");
}
