import { prisma } from "@/lib/prisma";

/** Danh sách gợi ý yokai (cùng game) + nhóm món ăn cho form. */
export async function formOptions(game: number) {
  const [options, foods] = await Promise.all([
    prisma.yokai.findMany({ where: { game }, orderBy: { number: "asc" }, select: { name: true, slug: true, image: true } }),
    prisma.foodCategory.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
  ]);
  return { options, foods };
}
