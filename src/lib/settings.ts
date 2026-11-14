// Cài đặt chung cho site public (có cache). Làm mới bằng updateTag(SETTINGS_TAG).
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { readGeneralSettings, type GeneralSettings } from "./settings-store";

export const SETTINGS_TAG = "settings";

/** Bản có cache cho site public (metadata). Làm mới bằng updateTag(SETTINGS_TAG). */
export async function getGeneralSettings(): Promise<GeneralSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(SETTINGS_TAG);
  return readGeneralSettings();
}

/** Thẻ <link rel="icon"> từ cài đặt favicon (rỗng = /favicon.ico mặc định trong /public). */
export function faviconIcons(favicon: string): Metadata["icons"] {
  const url = favicon || "/favicon.ico";
  return { icon: url, shortcut: url, apple: url };
}
