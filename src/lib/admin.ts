import "server-only";
import { updateTag } from "next/cache";
import { CONTENT_TAG } from "./data";
import { getTr } from "./admin-lang-server";

export type ActionState = { ok?: string; error?: string };

/** Làm mới toàn bộ cache nội dung public sau khi admin thay đổi dữ liệu. */
export function refreshContent() {
  updateTag(CONTENT_TAG);
}

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const int = (fd: FormData, key: string) => parseInt(str(fd, key), 10) || 0;
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";

export function json<T>(fd: FormData, key: string, fallback: T): T {
  try {
    const raw = fd.get(key);
    return raw ? (JSON.parse(String(raw)) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Chuẩn hoá thông báo lỗi Prisma thành câu dễ hiểu (theo ngôn ngữ admin). */
export async function errorMessage(e: unknown): Promise<string> {
  const { tr } = await getTr();
  const err = e as { code?: string; meta?: { target?: unknown }; message?: string };
  if (err?.code === "P2002") return tr(
      `Giá trị bị trùng (${String(err.meta?.target ?? "unique")}). Hãy chọn slug/mã khác.`,
      `Duplicate value (${String(err.meta?.target ?? "unique")}). Please choose another slug/code.`,
    );
  if (err?.code === "P2025") return tr("Không tìm thấy bản ghi.", "Record not found.");
  return err?.message ?? tr("Đã có lỗi xảy ra.", "Something went wrong.");
}

/** Bỏ các field rỗng hoàn toàn, chuẩn hoá chuỗi trong mảng rows từ RowsEditor. */
export function cleanRows<T extends Record<string, unknown>>(rows: T[], required: keyof T): T[] {
  return rows
    .filter((r) => {
      const v = r[required];
      return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "";
    })
    .map((r) => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r)) {
        if (k === "id") continue;
        out[k] = typeof v === "string" ? v.trim() : Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : v;
      }
      return out as T;
    });
}
