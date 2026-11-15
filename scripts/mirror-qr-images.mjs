// Tải ảnh QR (đang lấy từ Blogspot) về thư mục upload của website và đổi đường dẫn trong database.
//
//   node scripts/mirror-qr-images.mjs [--concurrency=4] [--dry] [--limit=N]
//
// - Đọc DATABASE_URL / UPLOAD_DIR từ biến môi trường hoặc file .env cạnh thư mục chạy (cwd).
// - Ảnh lưu ở <UPLOAD_DIR>/qr/<loại-coin>/<bộ-qr>-01.png …, đường dẫn mới /uploads/qr/... (route /uploads/[...path]).
// - Chạy lại được: ảnh đã là /uploads/... thì bỏ qua. Ảnh tải lỗi giữ nguyên link cũ và được liệt kê ở cuối.
// - Ảnh nhỏ bất thường (< 200 byte) hoặc không phải ảnh được liệt kê để kiểm tra (ảnh QR đen trắng thường chỉ ~0,5–11 KB).
// Trên hosting chạy trong ~/yokaidex với --concurrency=2 để không vượt hạn mức process.
import fs from "node:fs";
import path from "node:path";

// --- tham số ---
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const CONCURRENCY = Math.max(1, Number(args.concurrency) || 4);
const DRY = !!args.dry;
const LIMIT = Number(args.limit) || Infinity;

// --- .env (không ghi đè biến đã có) ---
const envFile = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const extOf = (url, type) => {
  if (/png/i.test(type)) return ".png";
  if (/jpe?g/i.test(type)) return ".jpg";
  if (/webp/i.test(type)) return ".webp";
  if (/gif/i.test(type)) return ".gif";
  const e = path.extname(new URL(url).pathname).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(e) ? e : ".png";
};
const safe = (s) => String(s).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "x";

async function download(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return { buf, type: res.headers.get("content-type") || "" };
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

const sets = await prisma.qrSet.findMany({
  include: { category: { select: { slug: true } } },
  orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
});

// danh sách việc: mỗi ảnh còn là link ngoài
const jobs = [];
for (const s of sets) {
  (s.slides ?? []).forEach((url, i) => {
    if (typeof url === "string" && /^https?:\/\//i.test(url)) jobs.push({ set: s, i, url });
  });
}
const todo = jobs.slice(0, LIMIT);
console.log(`${sets.length} bộ QR · ${jobs.length} ảnh còn là link ngoài · xử lý ${todo.length} · ${CONCURRENCY} luồng${DRY ? " · DRY RUN" : ""}`);
console.log(`Lưu vào: ${path.join(UPLOAD_DIR, "qr")}`);

const newSlides = new Map(sets.map((s) => [s.id, [...(s.slides ?? [])]]));
const failed = [];
const tiny = [];
let done = 0;

async function worker() {
  for (;;) {
    const job = todo.shift();
    if (!job) return;
    const { set, i, url } = job;
    try {
      const { buf, type } = await download(url);
      const dir = path.join(UPLOAD_DIR, "qr", safe(set.category.slug));
      const file = `${safe(set.slug)}-${String(i + 1).padStart(2, "0")}${extOf(url, type)}`;
      if (!DRY) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, file), buf);
      }
      newSlides.get(set.id)[i] = `/uploads/qr/${safe(set.category.slug)}/${file}`;
      if (buf.length < 200 || !/^image\//i.test(type)) tiny.push(`${set.category.slug}/${set.slug} #${i + 1} (${buf.length} B) ${url}`);
    } catch (e) {
      failed.push(`${set.category.slug}/${set.slug} #${i + 1}: ${e.message} ${url}`);
    }
    if (++done % 250 === 0) console.log(`  ${done} ảnh…`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// ghi database theo từng bộ đã có thay đổi
let updated = 0;
if (!DRY) {
  for (const s of sets) {
    const next = newSlides.get(s.id);
    if (JSON.stringify(next) !== JSON.stringify(s.slides)) {
      await prisma.qrSet.update({ where: { id: s.id }, data: { slides: next } });
      updated++;
    }
  }
}
await prisma.$disconnect();

console.log(`Xong: ${done - failed.length} ảnh tải về, ${failed.length} lỗi, ${updated} bộ QR được cập nhật.`);
if (tiny.length) console.log(`\nẢnh nhỏ bất thường (${tiny.length}) – có thể Blogspot đã xoá ảnh:\n` + tiny.join("\n"));
if (failed.length) console.log(`\nẢnh lỗi (${failed.length}) – giữ link cũ, chạy lại script để thử tiếp:\n` + failed.join("\n"));
