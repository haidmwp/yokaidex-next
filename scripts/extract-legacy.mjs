// Trích xuất dữ liệu từ dự án CRA cũ (JSON + các trang JSX hardcode) thành
// prisma/seed-data/*.json. Chạy 1 lần:  node scripts/extract-legacy.mjs [đường-dẫn-dự-án-cũ]
import fs from "node:fs";
import path from "node:path";

const LEGACY = path.resolve(process.argv[2] || path.join(process.cwd(), "..", "yokaidex"));
const SRC = path.join(LEGACY, "src");
const OUT = path.join(process.cwd(), "prisma", "seed-data");
fs.mkdirSync(OUT, { recursive: true });

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(SRC, "assets/jsons", f), "utf8"));
const readPage = (f) => fs.readFileSync(path.join(SRC, "pages", f), "utf8");
const write = (name, data) => {
  fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(data, null, 2));
  console.log(`✓ ${name}: ${Array.isArray(data) ? data.length : Object.keys(data).length}`);
};
// "../img/x.png" -> "/img/x.png"
const img = (p) => (p ? p.replace(/^(\.\.\/)+/, "/").replace(/^img\//, "/img/") : "");
const decode = (s) =>
  s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/** Bản đồ biến import -> đường dẫn public */
function importMap(src) {
  const map = {};
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+'\.\.\/\.\.\/assets\/img\/([^']+)'/g)) {
    const rel = m[2];
    let p;
    if (rel.startsWith("food/") || rel.startsWith("specialsoul/")) p = "/img/" + rel;
    else p = "/img/ui/" + rel;
    map[m[1]] = p;
  }
  return map;
}

// ---------------- Yokai ----------------
const TRIBE_FIX = { Touch: "Tough" };
const part = (arr, slug, image, self) => {
  const isYokai = arr[1] === "yokai" || arr[0] === self;
  return { name: arr[0] || "", slug: isYokai ? slug || "" : "", image: img(image), isYokai };
};

const yokais = readJson("yokaidb.json").map((y) => {
  const im = y.img[0];
  const ms = y.moveset[0];
  const fusions = [];
  const fz = [
    [y.fusion[0], ["fusion01", "fusion02", "fusion03"], ["evoimg1", "evoimg2", "evoimg3"]],
    [y.fusion01[0], ["fusion04", "fusion05", "fusion06"], ["evoimg4", "evoimg5", "evoimg6"]],
    [y.fusion02[0], ["fusion07", "fusion08", "fusion09"], ["evoimg7", "evoimg8", "evoimg9"]],
  ];
  for (const [f, keys, imgs] of fz) {
    if (!f[keys[0]][0]) continue;
    const result = f[keys[2]];
    fusions.push({
      a: part(f[keys[0]], f.slug[0], im[imgs[0]], y.name),
      b: part(f[keys[1]], f.slug[1], im[imgs[1]], y.name),
      result: { name: result[0], slug: f.slug[2] || "", image: img(im[imgs[2]]), isYokai: true },
    });
  }
  const ev = y.evolution[0];
  const evolution = ev.yokai[0]
    ? {
        from: { name: ev.yokai[0], slug: ev.slug[0] || "", image: img(im.evoimg7) },
        level: ev.yokai[1] || "",
        to: { name: ev.yokai[2], slug: ev.slug[1] || "", image: img(im.evoimg9) },
      }
    : null;
  const toInt = (s) => parseInt(String(s).replace(/[^\d]/g, ""), 10) || 0;
  return {
    number: y.key,
    name: y.name,
    slug: y.slug,
    rank: y.rank[0],
    tribe: TRIBE_FIX[y.tribe] || y.tribe,
    attribute: y.attribute,
    color: y.bgcolor,
    image: img(im.yokaiimg),
    foodSlug: y.food[1] || "",
    hp: toInt(y.stats[0]),
    str: toInt(y.stats[1]),
    spr: toInt(y.stats[2]),
    def: toInt(y.stats[3]),
    spd: toInt(y.stats[4]),
    profile: y.moreinfo.filter(Boolean),
    evolution,
    fusions,
    moveset: {
      attack: { name: ms.attack[0], power: ms.attack[1], target: ms.attack[2] },
      technique: { name: ms.technique[0], power: ms.technique[1], target: ms.technique[2], image: img(im.techimg) },
      inspirit: { name: ms.inspirit[0], power: ms.inspirit[1], target: ms.inspirit[2], description: ms.desc1 || "" },
      soultimate: {
        name: ms.soultimate[0],
        power: ms.soultimate[1],
        target: ms.soultimate[2],
        image1: img(im.soutimateimg1),
        image2: img(im.soutimateimg2),
        description: ms.desc2 || "",
      },
      skill: { name: ms.skill[0], power: ms.skill[1], target: ms.skill[2], description: ms.desc3 || "" },
    },
  };
});
write("yokais", yokais);

// ---------------- Food ----------------
const routes = fs.readFileSync(path.join(SRC, "routes/index.js"), "utf8");
const foodIndex = readPage("Food/index.js");
const foodIndexImgs = importMap(foodIndex);
const foodCats = [];
let order = 0;
for (const m of routes.matchAll(/import (\w+) from '\.\.\/pages\/Food\/(\w+)\.js'/g)) {
  const [, comp, file] = m;
  const slug = routes.match(new RegExp(`path: '/food/([\\w-]+)', component: ${comp} `))[1];
  const src = readPage(`Food/${file}.js`);
  const imap = importMap(src);
  const name = decode(src.match(/header-title">([^<]+)</)[1]);
  const color = src.match(/header-content" style={{ backgroundColor: "(#[0-9A-Fa-f]+)"/)[1];
  const card = foodIndex.match(new RegExp(`to={\`/food/${slug}\`}>\\s*<img[^>]*src={(\\w+)}`));
  const items = [];
  const body = src.split("<tbody>")[1] || "";
  for (const r of body.matchAll(
    /<tr>\s*<td>([^<]*)<\/td>\s*<td><img[^>]*src={(\w+)}[^>]*\/><\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/g,
  )) {
    items.push({ name: decode(r[1]), image: imap[r[2]] || "", onFriend: decode(r[3]), onFoe: decode(r[4]) });
  }
  foodCats.push({ name, slug, color, image: card ? foodIndexImgs[card[1]] : items[0]?.image || "", sortOrder: order++, items });
}
foodCats.sort((a, b) => a.name.localeCompare(b.name)).forEach((c, i) => (c.sortOrder = i));
write("food", foodCats);

// ---------------- QR ----------------
const qrSlides = new Map(readJson("qrslide.json").map((s) => [s.slug, s]));
const qr = readJson("qrcode.json").map((c, i) => ({
  name: c.name,
  slug: c.slug,
  icon: img(c.icon),
  color: c.bgcolor,
  sortOrder: i,
  sets: c.coin[0].slug
    .map((s, j) => (s ? { s, j } : null))
    .filter(Boolean)
    .map(({ s, j }) => {
      const sl = qrSlides.get(s);
      return { name: c.coin[0].title[j] || sl.name, slug: s, color: sl.bgcolor, slides: sl.slide.filter(Boolean), sortOrder: j };
    }),
}));
write("qr", qr);

// ---------------- Baffle board ----------------
const bb = readJson("baffleboarddb.json");
const baffle = [];
for (const [key, game] of [["baffleboards3", "yw3"], ["baffleboards2", "yw2"], ["gateofwhimsy", "gate-of-whimsy"]]) {
  bb[key].forEach((b, i) =>
    baffle.push({ game, location: b.location || "", clues: b.clues, solution: b.solution, slug: b.slug || "", effect: b.effect || "", sortOrder: i }),
  );
}
write("baffleboards", baffle);

// ---------------- Passwords ----------------
const regions = [];
for (const game of [1, 2, 3]) {
  const db = readJson(`psyw${game}db.json`);
  const idx = readPage(`Password${game}/index.js`);
  const cards = [...idx.matchAll(/backgroundColor: '(#[0-9A-Fa-f]+)' }}>\s*<Link to={`\/password-\d\/([\w-]+)`}>([^<]+)</g)];
  cards.forEach(([, color, code, label], i) => {
    // tìm file trang con dùng code này để biết key JSON
    const comp = routes.match(new RegExp(`path: '/password-${game}/${code}', component: (\\w+) `))[1];
    const page = readPage(`Password${game}/${comp}.js`);
    const key = page.match(/Password\d?\.(\w+)\.map/)[1];
    regions.push({
      game,
      code,
      label: label.trim(),
      color,
      sortOrder: i,
      passwords: db[key].map((p, j) => ({ code: p.key, effect: p.effect, sortOrder: j })),
    });
  });
}
write("passwords", regions);

// ---------------- Attitudes ----------------
const att = readPage("Attitudes/index.js").split("<tbody>")[1];
const attitudes = [...att.matchAll(/<tr>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/g)].map(
  (r, i) => ({ name: decode(r[1]), stats: decode(r[2]), preference: decode(r[3]), book: decode(r[4]), sortOrder: i }),
);
write("attitudes", attitudes);

// ---------------- Special souls ----------------
const ssSrc = readPage("RARESpecialSoul/index.js");
const ssImg = importMap(ssSrc);
const blocks = ssSrc.split('<div className="rare-special-soul">').slice(1);
const souls = blocks.map((b, i) => {
  const links = [...b.matchAll(/to="\/yokai-information\/([\w-]+)">\s*<img[^>]*src={(\w+)}[^>]*\/>\s*<span className="rare-special-soul-title">([^<]+)</g)];
  const res = b.match(/rare-special-soul-equal">=<\/span>\s*<span className="special-soul">\s*<img[^>]*src={(\w+)}[^>]*\/>\s*<span className="rare-special-soul-title">([^<]+)</);
  const desc = b.match(/rare-special-soul-desc">\s*<span>([^<]*)</);
  return {
    soul1Name: decode(links[0][3]),
    soul1Slug: links[0][1],
    soul1Image: ssImg[links[0][2]],
    soul2Name: decode(links[1][3]),
    soul2Slug: links[1][1],
    soul2Image: ssImg[links[1][2]],
    resultName: decode(res[2]),
    resultImage: ssImg[res[1]],
    description: desc ? decode(desc[1]) : "",
    sortOrder: i,
  };
});
write("specialsouls", souls);

// ---------------- Changelog ----------------
const cl = readPage("Changelog/index.js");
const changelog = [...cl.matchAll(/changelog-content-title">([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>/g)].map((m, i) => ({
  version: decode(m[1]),
  items: [...m[2].matchAll(/<p>-?\s*([^<]*)<\/p>/g)].map((p) => decode(p[1])),
  sortOrder: i,
}));
write("changelog", changelog);

// ---------------- Pages (Home, Privacy) ----------------
const jsxToHtml = (s) =>
  s
    .replace(/className=/g, "class=")
    .replace(/<Link to="([^"]+)">/g, '<a href="$1">')
    .replace(/<\/Link>/g, "</a>")
    .replace(/target="_bank"/g, 'target="_blank"')
    .replace(/heigh=/g, "height=")
    .replace(/src={(\w+)}/g, (_, v) => `src="${v}"`)
    .replace(/\n\s+/g, "\n")
    .trim();

const home = readPage("Home/index.js");
const homeImgs = importMap(home);
let homeHtml = home.match(/<div className="home">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)/)[1];
homeHtml = jsxToHtml(homeHtml).replace(/src="(\w+)"/g, (_, v) => `src="${homeImgs[v] || v}"`);
const privacy = readPage("PrivacyPolicy/index.js");
const privacyHtml = jsxToHtml(privacy.match(/<div className="privacy-policy">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)[1]);
const privColor = privacy.match(/header-content" style={{ backgroundColor: "(#[0-9A-Fa-f]+)"/)[1];
write("pages", [
  {
    slug: "home",
    title: "Home",
    color: "#758EFF",
    description: "The site contains informations about all the yo-kais, their favorite foods, locations, items, evolutions, stats, etc.",
    content: homeHtml,
  },
  { slug: "privacy-policy", title: "Privacy Policy", color: privColor, description: "", content: privacyHtml },
]);
