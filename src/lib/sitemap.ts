// Sitemap kiểu Yoast SEO: /sitemap.xml (= /sitemap_index.xml) là index, trỏ tới các sitemap con
// theo nhóm (page-sitemap.xml, yokai-watch-1-sitemap.xml, …). Mỗi file gắn stylesheet /sitemap.xsl
// để hiển thị dạng bảng khi mở bằng trình duyệt; Google vẫn đọc XML bình thường.
import { getSitemapData } from "./data";
import { getGeneralSettings } from "./settings";

type Entry = { loc: string; lastmod?: string; images?: string[] };
type Data = Awaited<ReturnType<typeof getSitemapData>>;

/** Nhóm -> tên file sitemap con (cùng id với SITEMAP_SECTIONS trong cài đặt). */
export const SITEMAP_FILES = {
  pages: "page-sitemap.xml",
  yw1: "yokai-watch-1-sitemap.xml",
  yw2: "yokai-watch-2-sitemap.xml",
  yw3: "yokai-watch-3-sitemap.xml",
  food: "food-sitemap.xml",
  qr: "qr-code-sitemap.xml",
  password: "password-sitemap.xml",
} as const;
export type SitemapSection = keyof typeof SITEMAP_FILES;

const STATIC_PAGES = [
  "/medallium",
  "/yokai-watch-1",
  "/yokai-watch-2",
  "/yokai-watch-3",
  "/qr-code",
  "/baffle-board",
  "/attitudes",
  "/password",
  "/password-1",
  "/password-2",
  "/password-3",
  "/rare-special-soul",
  "/food",
  "/contact",
  "/changelog",
];

function entries(section: SitemapSection, d: Data, base: string): Entry[] {
  const abs = (p: string) => (/^https?:\/\//.test(p) ? p : `${base}${p}`);
  switch (section) {
    case "pages":
      return [
        { loc: abs("/"), lastmod: d.pages["home"] },
        ...STATIC_PAGES.map((p) => ({ loc: abs(p) })),
        { loc: abs("/privacy-policy"), lastmod: d.pages["privacy-policy"] },
      ];
    case "yw1":
    case "yw2":
    case "yw3": {
      const g = Number(section.slice(2));
      return d.yokais
        .filter((y) => y.game === g)
        .map((y) => ({ loc: abs(`/yokai-watch-${g}/${y.slug}`), lastmod: y.updatedAt, images: y.image ? [abs(y.image)] : [] }));
    }
    case "food":
      return d.foods.map((f) => ({ loc: abs(`/food/${f.slug}`), images: f.image ? [abs(f.image)] : [] }));
    case "qr":
      return [...d.qrCats.map((c) => ({ loc: abs(`/qr-code/${c}`) })), ...d.qrSets.map((q) => ({ loc: abs(`/qr-code/${q.cat}/${q.slug}`) }))];
    case "password":
      return d.regions.map((r) => ({ loc: abs(`/password-${r.game}/${r.code}`) }));
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';

function xml(body: string) {
  return new Response(HEAD + body, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "X-Robots-Tag": "noindex, follow" },
  });
}

const notFound = () => new Response("Not found", { status: 404 });

const latest = (list: Entry[]) =>
  list.reduce<string | undefined>((m, e) => (e.lastmod && (!m || e.lastmod > m) ? e.lastmod : m), undefined);

/** /sitemap.xml và /sitemap_index.xml */
export async function sitemapIndexResponse() {
  const s = await getGeneralSettings();
  if (!s.sitemapEnabled) return notFound();
  const d = await getSitemapData();
  const items = (Object.keys(SITEMAP_FILES) as SitemapSection[])
    .filter((id) => s.sitemapSections.includes(id))
    .map((id) => {
      const list = entries(id, d, s.siteUrl);
      const lm = latest(list);
      return `<sitemap><loc>${esc(`${s.siteUrl}/${SITEMAP_FILES[id]}`)}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ""}</sitemap>`;
    });
  return xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</sitemapindex>`);
}

/** Một sitemap con */
export async function sitemapSectionResponse(section: SitemapSection) {
  const s = await getGeneralSettings();
  if (!s.sitemapEnabled || !s.sitemapSections.includes(section)) return notFound();
  const list = entries(section, await getSitemapData(), s.siteUrl);
  const urls = list.map(
    (e) =>
      `<url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}${(e.images ?? [])
        .map((i) => `<image:image><image:loc>${esc(i)}</image:loc></image:image>`)
        .join("")}</url>`,
  );
  return xml(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>`,
  );
}
