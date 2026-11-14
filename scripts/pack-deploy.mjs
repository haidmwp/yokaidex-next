// Đóng gói bản deploy cho hosting iNET OnePanel (CloudLinux + LiteSpeed/Passenger, Node.js Selector).
//
//   npm run build && node scripts/pack-deploy.mjs <thư-mục-ra> [--with-data]
//
// Tạo <ra>/yokaidex (app: .next/standalone + static + public + .env production).
// --with-data: thêm <ra>/yokaidex-data (database, ảnh upload, khoá GA) – CHỈ dùng lần deploy đầu,
// các lần sau giữ nguyên dữ liệu trên hosting.
//
// Trên hosting (home /home/mpcaxydchosting):
//   ~/yokaidex        app root của Node.js app (cloudlinux-selector, startup file server.js, Node 22)
//   ~/yokaidex-data   dữ liệu, nằm ngoài app nên deploy lại không bị ghi đè
// Deploy lại: `cloudlinux-selector stop ...` TRƯỚC, thay ~/yokaidex/.next + server.js, rồi `cloudlinux-selector start
// --json --interpreter nodejs --app-root yokaidex`. Không dùng `restart`: tiến trình cũ và mới chạy song song có thể
// vượt hạn mức process của hosting và làm web treo.
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(import.meta.dirname, "..");
const OUT = process.argv[2];
const WITH_DATA = process.argv.includes("--with-data");
const HOME = process.env.DEPLOY_HOME || "/home/mpcaxydchosting";
if (!OUT) throw new Error("Thiếu thư mục ra: node scripts/pack-deploy.mjs <thư-mục-ra>");

const APP = `${OUT}/yokaidex`;
const DATA = `${OUT}/yokaidex-data`;
fs.rmSync(APP, { recursive: true, force: true });
const cp = (a, b) => fs.cpSync(a, b, { recursive: true });

cp(`${SRC}/.next/standalone`, APP);
for (const x of ["src", "scripts", "secrets", "prisma/seed-data", "prisma/dev.db", "uploads", ".env"]) {
  fs.rmSync(`${APP}/${x}`, { recursive: true, force: true });
}
for (const f of fs.readdirSync(`${APP}/node_modules/.prisma/client`)) {
  if (/windows|darwin|debian/.test(f)) fs.rmSync(`${APP}/node_modules/.prisma/client/${f}`, { force: true });
}
cp(`${SRC}/.next/static`, `${APP}/.next/static`);
fs.rmSync(`${APP}/public`, { recursive: true, force: true });
cp(`${SRC}/public`, `${APP}/public`);
cp(`${SRC}/prisma/schema.prisma`, `${APP}/prisma/schema.prisma`);

if (WITH_DATA) {
  fs.rmSync(DATA, { recursive: true, force: true });
  fs.mkdirSync(`${DATA}/uploads`, { recursive: true });
  fs.mkdirSync(`${DATA}/secrets`, { recursive: true });
  cp(`${SRC}/prisma/dev.db`, `${DATA}/yokaidex.db`);
  if (fs.existsSync(`${SRC}/secrets/ga-service-account.json`)) {
    cp(`${SRC}/secrets/ga-service-account.json`, `${DATA}/secrets/ga-service-account.json`);
  }
  if (fs.existsSync(`${SRC}/uploads`)) cp(`${SRC}/uploads`, `${DATA}/uploads`);
}

const env = Object.fromEntries(
  fs
    .readFileSync(`${SRC}/.env`, "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_]+)="?(.*?)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const prod = {
  DATABASE_URL: `file:${HOME}/yokaidex-data/yokaidex.db?connection_limit=1`,
  AUTH_SECRET: env.AUTH_SECRET,
  NEXT_PUBLIC_GA_ID: env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
  GA_PROPERTY_ID: env.GA_PROPERTY_ID,
  GA_CREDENTIALS_FILE: `${HOME}/yokaidex-data/secrets/ga-service-account.json`,
  UPLOAD_DIR: `${HOME}/yokaidex-data/uploads`,
  // CageFS không cho Prisma đọc thông tin hệ điều hành -> chỉ thẳng engine RHEL 8 (OpenSSL 1.1)
  PRISMA_QUERY_ENGINE_LIBRARY: `${HOME}/yokaidex/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.1.x.so.node`,
  // Hosting tính cả luồng vào hạn mức 150 "process". Mặc định Prisma (tokio) tạo số luồng = số nhân CPU
  // của máy chủ (rất nhiều) -> giới hạn lại để 1-2 tiến trình Node không ăn hết hạn mức.
  TOKIO_WORKER_THREADS: "2",
  UV_THREADPOOL_SIZE: "2",
};
fs.writeFileSync(`${APP}/.env`, Object.entries(prod).map(([k, v]) => `${k}="${v ?? ""}"`).join("\n") + "\n");
const missing = Object.entries(prod).filter(([, v]) => !v).map(([k]) => k);
console.log(`Đã đóng gói vào ${OUT}${WITH_DATA ? " (kèm dữ liệu)" : ""}.`, missing.length ? `Thiếu: ${missing.join(", ")}` : "");
