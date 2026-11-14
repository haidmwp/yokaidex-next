// Cào danh sách Medallium Yo-kai Watch 1 & 2 từ Yo-kai Watch Wiki (fandom) qua MediaWiki API
// và ghi ra prisma/seed-data/yokais-yw1.json, yokais-yw2.json.
//   node scripts/scrape-fandom.mjs
// Ảnh & màu nền lấy lại từ dữ liệu Yo-kai Watch 3 (khớp theo tên) để dùng ảnh chất lượng cao có sẵn.
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "prisma", "seed-data");
const API = "https://yokaiwatch.fandom.com/api.php";
const PAGES = {
  1: "List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch)",
  2: "List_of_Yo-kai_by_Medallium_Number_(Yo-kai_Watch_2)",
};
const VERSIONS = { BS: "Bony Spirits", FS: "Fleshy Souls", PS: "Psychic Specters" };
const NAME_ALIAS = { "Shad. Venoct": "Shadow Venoct" };
const TRIBE_COLOR = {
  Brave: "#E85A3D",
  Mysterious: "#FFC648",
  Tough: "#FF8041",
  Charming: "#FBA6CC",
  Heartful: "#6DAA73",
  Shady: "#7A9BBF",
  Eerie: "#AA90B4",
  Slippery: "#68E7EC",
  Wicked: "#5D5DFF",
  Enma: "#DA9090",
  Wandroid: "#2679FF",
};
const FOOD_ALIAS = { Vegetables: "veggies", "Soba Noodles": "soba" };

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function wikitext(page) {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2`;
  const res = await fetch(url, { headers: { "User-Agent": "YokaiDex data import (Next.js)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${page}`);
  return (await res.json()).parse.wikitext;
}

function rows(wt) {
  const out = [];
  for (const table of wt.split("{|").slice(1)) {
    for (const raw of table.split("|}")[0].split(/\n\|-[^\n]*/).slice(1)) {
      const cells = raw.split("\n").filter((l) => l.startsWith("|")).map((l) => l.slice(1).trim());
      if (cells.length >= 6) out.push(cells);
    }
  }
  return out;
}

const linkText = (s) => {
  const m = s.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (m) return (m[2] || m[1]).trim();
  const e = s.match(/\[https?:\S+\s+([^\]]+)\]/);
  if (e) return e[1].trim();
  return s.replace(/\{\{[^}]*\}\}/g, "").replace(/<[^>]+>/g, "").trim();
};
const linkPage = (s) => (s.match(/\[\[([^\]|]+)/) || [])[1]?.trim() || "";
const file = (s) => (s.match(/\[\[(?:File|Image):([^|\]]+)/i) || [])[1]?.trim() || "";
const linkParam = (s) => (s.match(/link=\s*([^\]|]*)/) || [])[1]?.trim() || "";

// ---------------- Trang chi tiết ----------------

/** Lấy wikitext nhiều trang (50 trang / request), theo dõi redirect. Trả về Map<tên gốc, wikitext>. */
async function fetchPages(titles) {
  const out = new Map();
  const uniq = [...new Set(titles)];
  for (let i = 0; i < uniq.length; i += 50) {
    const batch = uniq.slice(i, i + 50);
    const url =
      `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&format=json&formatversion=2` +
      `&titles=${encodeURIComponent(batch.join("|"))}`;
    const res = await fetch(url, { headers: { "User-Agent": "YokaiDex data import (Next.js)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const q = (await res.json()).query;
    const alias = new Map();
    for (const n of q.normalized ?? []) alias.set(n.from, n.to);
    for (const r of q.redirects ?? []) alias.set(r.from, r.to);
    const text = new Map(q.pages.map((p) => [p.title, p.revisions?.[0]?.slots?.main?.content ?? ""]));
    for (const t of batch) {
      let k = t;
      for (let n = 0; n < 3 && alias.has(k); n++) k = alias.get(k);
      out.set(t, text.get(k) ?? "");
    }
    process.stdout.write(`  … ${Math.min(i + 50, uniq.length)}/${uniq.length} trang\r`);
    await new Promise((r) => setTimeout(r, 400)); // lịch sự với server
  }
  return out;
}

/** Tách tham số template ở cấp ngoài cùng (bỏ qua | nằm trong {{ }} hoặc [[ ]]). */
function templateArgs(body) {
  const args = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === "{{" || two === "[[") {
      depth++;
      cur += two;
      i++;
      continue;
    }
    if (two === "}}" || two === "]]") {
      depth--;
      cur += two;
      i++;
      continue;
    }
    if (body[i] === "|" && depth === 0) {
      args.push(cur);
      cur = "";
      continue;
    }
    cur += body[i];
  }
  args.push(cur);
  const pos = [];
  const named = {};
  for (const a of args.slice(1)) {
    const m = a.match(/^\s*([\w -]+?)\s*=([\s\S]*)$/);
    if (m && !/^\d+$/.test(m[1])) named[m[1].toLowerCase()] = m[2].trim();
    else if (m) pos[Number(m[1]) - 1] = m[2].trim();
    else pos.push(a.trim());
  }
  return { pos: Array.from(pos, (v) => v ?? ""), named };
}

/** Tìm tất cả template {{name|...}} (cân bằng ngoặc), trả về phần bên trong. */
function templates(text, name) {
  const out = [];
  const re = new RegExp(`\\{\\{\\s*${name}\\s*\\|`, "gi");
  let m;
  while ((m = re.exec(text))) {
    let depth = 0;
    let i = m.index;
    for (; i < text.length; i++) {
      if (text.startsWith("{{", i)) {
        depth++;
        i++;
      } else if (text.startsWith("}}", i)) {
        depth--;
        i++;
        if (depth === 0) break;
      }
    }
    out.push(text.slice(m.index + 2, i - 1));
  }
  return out;
}

/** Wikitext -> chữ thường. */
function plain(s) {
  let t = s;
  t = t.replace(/<ref[^>]*\/>/gi, "").replace(/<ref[\s\S]*?<\/ref>/gi, "");
  // {{translation|English|...}} -> English (quét cân bằng ngoặc vì hay lồng template khác)
  for (const inner of templates(t, "translation")) {
    t = t.replace(`{{${inner}}}`, templateArgs(inner).pos[0] ?? "");
  }
  for (let n = 0; n < 3; n++) t = t.replace(/\{\{[^{}]*\}\}/g, "");
  t = t.replace(/\[\[(?:File|Image|Category):[^\]]*\]\]/gi, "");
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, "$1");
  t = t.replace(/\[https?:\S+\s+([^\]]+)\]/g, "$1");
  t = t.replace(/'''?/g, "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "");
  return t.replace(/&nbsp;/g, " ").replace(/[ \t]+/g, " ").trim();
}

const headingText = (h) => plain(h.trim().replace(/^=+|=+$/g, "")).replace(/\s+/g, " ").trim();

/** Nội dung của mục có heading level `level` và tiêu đề đúng `title`. */
function section(text, level, title) {
  const re = new RegExp(`^={${level}}(?!=)(.+?)={${level}}\\s*$`, "gm");
  let m;
  while ((m = re.exec(text))) {
    if (headingText(m[0]) !== title) continue;
    const start = m.index + m[0].length;
    const next = new RegExp(`^={1,${level}}(?!=)[^=].*$`, "m").exec(text.slice(start));
    return text.slice(start, next ? start + next.index : undefined);
  }
  return "";
}

/**
 * Các game main-series mà một heading nhắc tới.
 *   "Yo-kai Watch and 2" -> [1,2] · "Yo-kai Watch to Yo-kai Watch 3" -> [1,2,3]
 *   "Yo-kai Watch 3 and Busters 2" -> [3] · "Yo-kai Watch: Wibble Wobble and Blasters" -> []
 */
function headingGames(h) {
  const t = headingText(h);
  const games = [];
  const re = /Yo-kai Watch(?!\s*(?::|Blasters|Busters|World|Jam|Puni|Ukiu|Medal|Wibble))(?:\s+(\d))?/g;
  let m;
  while ((m = re.exec(t))) games.push(m[1] ? Number(m[1]) : 1);
  for (const n of t.matchAll(/(?:\band\b|,|&)\s*(\d)\b/g)) games.push(Number(n[1]));
  if (/\bto\b/.test(t) && games.length >= 2) {
    const lo = Math.min(...games);
    const hi = Math.max(...games);
    for (let g = lo; g <= hi; g++) games.push(g);
  }
  return [...new Set(games)].filter((g) => g >= 1 && g <= 4);
}

/** Tách một mục Evolution/Fusion thành các đoạn áp dụng cho `game`. Không có heading con = áp dụng mọi game. */
function chunksForGame(sec, game) {
  const parts = sec.split(/^(?=====?[^=])/m);
  const out = [];
  for (const p of parts) {
    const h = p.match(/^(====?[^=][^\n]*?====?)\s*$/m);
    if (!h || p.indexOf(h[0]) > 0) {
      out.push(p); // phần không có heading con
      continue;
    }
    if (headingGames(h[1]).includes(game)) out.push(p.slice(h[0].length));
  }
  return out;
}

const GAME_HEADING = { 1: "Yo-kai Watch", 2: "Yo-kai Watch 2" };
const ATTRS = ["Fire", "Water", "Lightning", "Earth", "Ice", "Wind", "Drain", "Restoration"];
const power = (p) => plain(p).replace(/^-$/, "").replace(/^(\d+)\s*-\s*(\d+)$/, "$1 | $2");

function parseDetail(raw, game) {
  const res = { stats: null, moveset: null, profile: [] };
  if (!raw) return res;
  const wt = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/\r/g, "");
  const title = GAME_HEADING[game];

  // --- Game data
  const gameData = section(wt, 2, "Game data");
  const block = section(gameData, 4, title).split(/^=====/m)[0]; // bỏ phần Blasters stats
  const st = templates(block, "Stats")[0];
  if (st) {
    const { pos, named } = templateArgs(st);
    const nums = pos.filter((v) => /^\d+$/.test(v)).map(Number);
    const pick = (...k) => Number(k.map((x) => named[x]).find((v) => v && /^\d+$/.test(v)) ?? NaN);
    const s =
      nums.length >= 5
        ? nums.slice(0, 5)
        : [pick("hp"), pick("str", "strength", "power"), pick("spr", "spirit"), pick("def", "defense", "defence"), pick("spd", "speed")];
    if (s.every((n) => Number.isFinite(n))) res.stats = s;
  }
  const abilities = templates(block, "abilities");
  if (abilities.length) {
    const mv = JSON.parse(JSON.stringify(emptyMoveset));
    for (const a of abilities) {
      const { pos } = templateArgs(a);
      const [type, name, pw, elem, target, desc] = pos;
      const key = plain(type ?? "").toLowerCase();
      if (!(key in mv) || mv[key].name) continue; // giữ dòng đầu tiên mỗi loại
      const e = plain(elem ?? "");
      mv[key] = {
        ...mv[key],
        name: plain(name ?? ""),
        power: power(pw ?? ""),
        target: plain(target ?? ""),
        ...("description" in mv[key] ? { description: plain(desc ?? "") } : {}),
        ...(key === "technique" && ATTRS.includes(e) ? { image: `/img/attribute/${e}.png` } : {}),
      };
    }
    if (Object.values(mv).some((m) => m.name)) res.moveset = mv;
  }

  // --- Evolution / Fusion (mục con trong Game data)
  res.evolutions = [];
  res.fusions = [];
  for (const kind of ["Evolution", "Fusion"]) {
    const sec = section(gameData, 3, kind) || section(wt, 2, kind) || section(wt, 3, kind);
    if (!sec) continue;
    for (const chunk of chunksForGame(sec, game)) {
      if (kind === "Evolution") {
        for (const t of templates(chunk, "evolution")) {
          const { named } = templateArgs(t);
          if (named.name && named["name-2"]) {
            res.evolutions.push({ from: plain(named.name), level: plain(named.level ?? ""), to: plain(named["name-2"]) });
          }
        }
      } else {
        for (const t of templates(chunk, "fusion")) {
          const { named } = templateArgs(t);
          if (named.name && named["name-2"] && named["name-3"]) {
            res.fusions.push({ a: plain(named.name), b: plain(named["name-2"]), bItem: false, result: plain(named["name-3"]) });
          }
        }
        for (const t of templates(chunk, "fusion/item")) {
          const { named } = templateArgs(t);
          if (named.name && named["name-item"] && named["name-3"]) {
            res.fusions.push({
              a: plain(named.name),
              b: plain(named["name-item"]),
              bItem: true,
              itemFile: plain(named["image-item"] ?? ""),
              result: plain(named["name-3"]),
            });
          }
        }
      }
    }
  }

  // --- Profile
  // bảng wiki (vd. danh sách yo-kai mở phong ấn Legendary) -> "A, B, C."
  const tableToText = (s) =>
    s.replace(/\{\|[\s\S]*?\n\|\}/g, (tbl) => {
      const names = [...tbl.matchAll(/\[\[(?!File:|Image:)(?:[^\]|]*\|)?([^\]]+)\]\]/gi)].map((m) => m[1].trim());
      return names.length ? `\n${[...new Set(names)].join(", ")}.\n` : "";
    });
  const prof = tableToText(section(section(wt, 2, "Profile"), 3, title));
  res.profile = prof
    .split(/\n\s*\n/)
    .map((p) => plain(p.replace(/^\*\s*/gm, "• ")).replace(/\n+/g, " "))
    .filter((p) => p && !/stub/i.test(p));
  return res;
}

const yw3 = JSON.parse(fs.readFileSync(path.join(OUT, "yokais.json"), "utf8"));
const byName = new Map(yw3.map((y) => [norm(y.name), y]));
const foods = new Set(JSON.parse(fs.readFileSync(path.join(OUT, "food.json"), "utf8")).map((f) => f.slug));

const emptyMoveset = {
  attack: { name: "", power: "", target: "" },
  technique: { name: "", power: "", target: "", image: "" },
  inspirit: { name: "", power: "", target: "", description: "" },
  soultimate: { name: "", power: "", target: "", image1: "", image2: "", description: "" },
  skill: { name: "", power: "", target: "", description: "" },
};

/** Ảnh vật phẩm hợp thể: dùng file có sẵn trong public/img/items, nếu chưa có thì tải từ wiki. */
const ITEM_DIR = path.join(process.cwd(), "public", "img", "items");
const itemCache = new Map();
async function itemImage(name, wikiFile) {
  const base = name.replace(/\s+/g, "-");
  if (itemCache.has(base)) return itemCache.get(base);
  const existing = fs.readdirSync(ITEM_DIR).find((f) => f.replace(/\.\w+$/, "").toLowerCase() === base.toLowerCase());
  let url = existing ? `/img/items/${existing}` : "";
  if (!url && wikiFile) {
    try {
      const q = `${API}?action=query&titles=${encodeURIComponent("File:" + wikiFile)}&prop=imageinfo&iiprop=url&format=json&formatversion=2`;
      const info = await (await fetch(q, { headers: { "User-Agent": "YokaiDex data import (Next.js)" } })).json();
      const src = info.query?.pages?.[0]?.imageinfo?.[0]?.url;
      if (src) {
        const ext = (path.extname(new URL(src).pathname) || ".png").toLowerCase();
        const res = await fetch(src);
        if (res.ok) {
          fs.writeFileSync(path.join(ITEM_DIR, base + ext), Buffer.from(await res.arrayBuffer()));
          url = `/img/items/${base}${ext}`;
          console.log(`  ↓ tải ảnh vật phẩm ${name}`);
        }
      }
    } catch (e) {
      console.warn(`! không tải được ảnh vật phẩm ${name}: ${e.message}`);
    }
  }
  itemCache.set(base, url);
  return url;
}

// Debug: DEBUG_PAGE=Tanbo DEBUG_GAME=1 node scripts/scrape-fandom.mjs
if (process.env.DEBUG_PAGE) {
  const t = (await fetchPages([process.env.DEBUG_PAGE])).get(process.env.DEBUG_PAGE);
  console.log(JSON.stringify(parseDetail(t, Number(process.env.DEBUG_GAME || 1)), null, 2));
  process.exit(0);
}

for (const game of [1, 2]) {
  const list = rows(await wikitext(PAGES[game])).map((c) => {
    const rawName = linkText(c[2]);
    const name = NAME_ALIAS[rawName] ?? rawName;
    const ref = byName.get(norm(name));
    const version = (c[2].match(/\{\{Versionlink\|([^}]+)\}\}/i) || [])[1] || "";
    const tribe = (linkParam(c[4]) || file(c[4]).replace(/_Tribe.*$/i, "")).replace(/\s*\(tribe\)/i, "").trim();
    const attribute = (linkParam(c[5]) || file(c[5])).replace(/\s*\(attribute\)/i, "").replace(/[_ ]icon.*$/i, "").trim();
    const foodName = linkText(c[game === 2 ? 7 : 6]);
    const foodSlug = FOOD_ALIAS[foodName] ?? slugify(foodName);
    if (!ref) console.warn(`! YW${game}: không có ảnh cho ${name}`);
    if (!foods.has(foodSlug)) console.warn(`! YW${game}: món "${foodName}" không có trong Food`);
    return {
      _page: linkPage(c[2]) || rawName,
      game,
      number: c[0],
      name,
      slug: ref?.slug ?? slugify(name),
      rank: ((file(c[3]).match(/Rank_?\s?([SABCDE])/i) || [])[1] || "E").toUpperCase(),
      tribe,
      attribute,
      color: TRIBE_COLOR[tribe] ?? ref?.color ?? "#E85A3D",
      image: ref?.image ?? "",
      foodSlug: foods.has(foodSlug) ? foodSlug : "",
      hp: 0,
      str: 0,
      spr: 0,
      def: 0,
      spd: 0,
      profile: version ? [`Version exclusive: Yo-kai Watch 2 ${VERSIONS[version] ?? version}.`] : [],
      evolution: null,
      fusions: [],
      moveset: emptyMoveset,
    };
  });
  // ---- chi tiết: stats, move set, profile từ trang của từng yo-kai
  const pages = await fetchPages(list.map((y) => y._page));
  // tra yo-kai trong Medallium của chính game này
  const inGame = new Map(list.map((y) => [norm(y.name), y]));
  const findYokai = (n) => inGame.get(norm(NAME_ALIAS[n] ?? n));
  const part = (n) => {
    const y = findYokai(n);
    return y ? { name: y.name, slug: y.slug, image: y.image, isYokai: true } : null;
  };

  let withStats = 0, withMoves = 0, withProfile = 0, withEvo = 0, withFusion = 0;
  for (const y of list) {
    const d = parseDetail(pages.get(y._page) ?? "", game);
    if (d.stats) { [y.hp, y.str, y.spr, y.def, y.spd] = d.stats; withStats++; }
    if (d.moveset) { y.moveset = d.moveset; withMoves++; }
    if (d.profile.length) { y.profile = [...d.profile, ...y.profile]; withProfile++; }

    // Evolution: lấy công thức có chính yo-kai này, cả 2 đầu đều có trong game
    for (const e of d.evolutions) {
      const from = part(e.from);
      const to = part(e.to);
      if (!from || !to || (from.slug !== y.slug && to.slug !== y.slug)) continue;
      y.evolution = {
        from: { name: from.name, slug: from.slug, image: from.image },
        level: e.level ? `Lv.${e.level.replace(/^Lv\.?\s*/i, "")}` : "",
        to: { name: to.name, slug: to.slug, image: to.image },
      };
      withEvo++;
      break;
    }

    // Fusion: mọi yo-kai trong công thức phải có trong game; vật phẩm lấy ảnh local hoặc tải về
    const seen = new Set();
    for (const f of d.fusions) {
      const a = part(f.a);
      const result = part(f.result);
      const b = f.bItem ? { name: f.b, slug: "", image: await itemImage(f.b, f.itemFile), isYokai: false } : part(f.b);
      if (!a || !b || !result) continue;
      if (![a.slug, b.slug, result.slug].includes(y.slug)) continue;
      const key = `${a.name}+${b.name}=${result.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      y.fusions.push({ a, b, result });
    }
    if (y.fusions.length) withFusion++;
    if (process.env.REPORT) {
      const raw = pages.get(y._page) ?? "";
      if (!y.evolution && /\{\{\s*evolution\s*\|/i.test(raw)) console.log(`  · YW${game} không nhận evolution: ${y.name} (wiki có ${d.evolutions.length} công thức cho game này)`);
      if (!y.fusions.length && /\{\{\s*fusion(\/item)?\s*\|/i.test(raw)) console.log(`  · YW${game} không nhận fusion: ${y.name} (wiki có ${d.fusions.length} công thức cho game này)`);
    }
    delete y._page;
  }
  fs.writeFileSync(path.join(OUT, `yokais-yw${game}.json`), JSON.stringify(list, null, 2));
  console.log(
    `✓ Yo-kai Watch ${game}: ${list.length} yo-kai · stats ${withStats} · move set ${withMoves} · profile ${withProfile} · evolution ${withEvo} · fusion ${withFusion}`,
  );
}
