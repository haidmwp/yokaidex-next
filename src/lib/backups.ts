// Sao lưu database SQLite: mỗi ngày tự tạo 1 bản (khi server khởi động / mỗi giờ kiểm tra lại),
// giữ KEEP bản mới nhất. Dùng `VACUUM INTO` nên bản sao luôn nhất quán dù app đang ghi.
//
// Thư mục: BACKUP_DIR, mặc định <thư mục chứa database>/backups
//   local:   prisma/backups
//   hosting: ~/yokaidex-data/backups
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "./prisma";

export const KEEP = 7;
const PREFIX = "yokaidex-";
const NAME_RE = /^yokaidex-\d{4}-\d{2}-\d{2}_\d{6}(-manual)?\.db$/;

function dbFile() {
  const url = (process.env.DATABASE_URL ?? "").replace(/^file:/, "").split("?")[0];
  // đường dẫn tương đối được Prisma tính từ thư mục chứa schema.prisma
  return path.isAbsolute(url) ? url : path.resolve(/*turbopackIgnore: true*/ process.cwd(), "prisma", url);
}

export function backupDir() {
  return path.resolve(/*turbopackIgnore: true*/ process.env.BACKUP_DIR || path.join(path.dirname(dbFile()), "backups"));
}

/** Ngày giờ theo giờ Việt Nam: [YYYY-MM-DD, HHmmss] */
function stamp(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return [`${p.year}-${p.month}-${p.day}`, `${p.hour}${p.minute}${p.second}`] as const;
}

export type BackupFile = { name: string; size: number; createdAt: Date; manual: boolean };

export async function listBackups(): Promise<BackupFile[]> {
  const dir = backupDir();
  const names = await fs.readdir(dir).catch(() => [] as string[]);
  const files = await Promise.all(
    names
      .filter((n) => NAME_RE.test(n))
      .map(async (name) => {
        const st = await fs.stat(path.join(dir, name));
        return { name, size: st.size, createdAt: st.mtime, manual: name.endsWith("-manual.db") };
      }),
  );
  return files.sort((a, b) => b.name.localeCompare(a.name));
}

/** Tạo bản sao lưu mới rồi xoá bớt bản cũ (giữ KEEP bản). Trả về tên file. */
export async function createBackup(manual = false) {
  const dir = backupDir();
  await fs.mkdir(dir, { recursive: true });
  const [day, time] = stamp();
  const name = `${PREFIX}${day}_${time}${manual ? "-manual" : ""}.db`;
  const target = path.join(dir, name);
  await prisma.$executeRawUnsafe(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  const all = await listBackups();
  for (const old of all.slice(KEEP)) await fs.rm(path.join(dir, old.name), { force: true });
  return name;
}

/** Tạo bản sao lưu tự động nếu hôm nay chưa có bản nào. */
export async function ensureDailyBackup() {
  const [day] = stamp();
  const all = await listBackups();
  if (all.some((b) => b.name.startsWith(`${PREFIX}${day}_`))) return null;
  return createBackup(false);
}

/** Đường dẫn file sao lưu theo tên – chỉ nhận tên hợp lệ (chống ../). */
export function backupPath(name: string) {
  return NAME_RE.test(name) ? path.join(backupDir(), name) : null;
}

export async function deleteBackupFile(name: string) {
  const p = backupPath(name);
  if (p) await fs.rm(p, { force: true });
}
