// Truy vấn dữ liệu cho site public – tất cả đều được cache ('use cache') với tag
// CONTENT_TAG. Admin gọi updateTag(CONTENT_TAG) sau mỗi thay đổi để làm mới.
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./prisma";
import type { Evolution, Fusion, Moveset, Socials, YokaiCard } from "./types";

export const CONTENT_TAG = "content";

function tag() {
  cacheLife("max");
  cacheTag(CONTENT_TAG);
}

export async function getPage(slug: string) {
  "use cache";
  tag();
  return prisma.page.findUnique({ where: { slug } });
}

export async function getYokaiCards(game: number): Promise<YokaiCard[]> {
  "use cache";
  tag();
  return prisma.yokai.findMany({
    where: { game, published: true },
    orderBy: { number: "asc" },
    select: { number: true, name: true, slug: true, rank: true, tribe: true, attribute: true, color: true, image: true },
  });
}

export async function getYokaiSlugs(game: number) {
  "use cache";
  tag();
  const rows = await prisma.yokai.findMany({ where: { game, published: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getYokai(game: number, slug: string) {
  "use cache";
  tag();
  const y = await prisma.yokai.findFirst({ where: { game, slug, published: true } });
  if (!y) return null;
  const food = y.foodSlug
    ? await prisma.foodCategory.findUnique({ where: { slug: y.foodSlug }, select: { name: true, slug: true, image: true } })
    : null;
  return {
    ...y,
    profile: (y.profile as string[]) ?? [],
    evolution: (y.evolution as Evolution) ?? null,
    fusions: (y.fusions as Fusion[]) ?? [],
    moveset: y.moveset as Moveset,
    food,
  };
}

export async function getFoodCategories() {
  "use cache";
  tag();
  return prisma.foodCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getFoodCategory(slug: string) {
  "use cache";
  tag();
  return prisma.foodCategory.findUnique({
    where: { slug },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
}

export async function getQrCategories() {
  "use cache";
  tag();
  return prisma.qrCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getQrCategory(slug: string) {
  "use cache";
  tag();
  const cat = await prisma.qrCategory.findUnique({
    where: { slug },
    include: { sets: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { name: true, slug: true, slides: true } } },
  });
  if (!cat) return null;
  // chỉ cần số ảnh của mỗi bộ (để hiện tiến độ "đã quét")
  return { ...cat, sets: cat.sets.map(({ slides, ...s }) => ({ ...s, total: Array.isArray(slides) ? slides.length : 0 })) };
}

export async function getQrSet(categorySlug: string, slug: string) {
  "use cache";
  tag();
  const set = await prisma.qrSet.findUnique({ where: { slug }, include: { category: true } });
  if (!set || set.category.slug !== categorySlug) return null;
  return { ...set, slides: (set.slides as string[]) ?? [] };
}

export async function getBaffleBoards() {
  "use cache";
  tag();
  const rows = await prisma.baffleBoard.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return rows.map((r) => ({ ...r, clues: (r.clues as string[]) ?? [] }));
}

export async function getPasswordRegions(game: number) {
  "use cache";
  tag();
  return prisma.passwordRegion.findMany({ where: { game }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getPasswordRegion(game: number, code: string) {
  "use cache";
  tag();
  return prisma.passwordRegion.findUnique({
    where: { game_code: { game, code } },
    include: { passwords: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
}

export async function getAttitudes() {
  "use cache";
  tag();
  return prisma.attitude.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getSpecialSouls() {
  "use cache";
  tag();
  return prisma.specialSoul.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
}

export async function getChangelog() {
  "use cache";
  tag();
  const rows = await prisma.changelog.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "desc" }] });
  return rows.map((r) => ({ ...r, items: (r.items as string[]) ?? [] }));
}

export async function getSocials(): Promise<Socials> {
  "use cache";
  tag();
  const row = await prisma.setting.findUnique({ where: { key: "socials" } });
  const v = (row?.value ?? {}) as Partial<Socials>;
  return { title: v.title ?? "Follow us on:", links: v.links ?? [] };
}

/** Dữ liệu cho /sitemap.xml – mọi trang public kèm thời điểm cập nhật nếu có. */
export async function getSitemapData() {
  "use cache";
  tag();
  const [yokais, foods, qrCats, qrSets, regions, pages] = await Promise.all([
    prisma.yokai.findMany({ where: { published: true }, orderBy: { number: "asc" }, select: { game: true, slug: true, image: true, updatedAt: true } }),
    prisma.foodCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, image: true } }),
    prisma.qrCategory.findMany({ select: { slug: true } }),
    prisma.qrSet.findMany({ select: { slug: true, category: { select: { slug: true } } } }),
    prisma.passwordRegion.findMany({ select: { game: true, code: true } }),
    prisma.page.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  return {
    yokais: yokais.map((y) => ({ game: y.game, slug: y.slug, image: y.image, updatedAt: y.updatedAt.toISOString() })),
    pages: Object.fromEntries(pages.map((p) => [p.slug, p.updatedAt.toISOString()])),
    foods: foods.map((f) => ({ slug: f.slug, image: f.image })),
    qrCats: qrCats.map((c) => c.slug),
    qrSets: qrSets.map((s) => ({ cat: s.category.slug, slug: s.slug })),
    regions: regions.map((r) => ({ game: r.game, code: r.code })),
  };
}
