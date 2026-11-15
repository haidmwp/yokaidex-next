"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/data";
import { SETTINGS_TAG } from "@/lib/settings";
import { createBackup, deleteBackupFile } from "@/lib/backups";

const PAGE = "/dashboard/maintenance";

/** Làm mới toàn bộ cache nội dung + cài đặt của site public (khi sửa thẳng database, chạy script...). */
export async function refreshCache() {
  await requireAdmin();
  updateTag(CONTENT_TAG);
  updateTag(SETTINGS_TAG);
  redirect(`${PAGE}?done=cache`);
}

export async function backupNow() {
  await requireAdmin();
  let name: string;
  try {
    name = await createBackup(true);
  } catch (e) {
    redirect(`${PAGE}?error=${encodeURIComponent((e as Error).message.slice(0, 200))}`);
  }
  redirect(`${PAGE}?done=backup&name=${encodeURIComponent(name)}`);
}

export async function deleteBackup(name: string) {
  await requireAdmin();
  await deleteBackupFile(name);
  redirect(`${PAGE}?done=deleted`);
}
