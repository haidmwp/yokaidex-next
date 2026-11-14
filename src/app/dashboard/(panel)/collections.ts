"use server";

// Lưu các bảng nội dung "một trang" – thay toàn bộ dòng bằng dữ liệu từ RowsEditor.
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, cleanRows, errorMessage, json, refreshContent, slugify, str } from "@/lib/admin";
import { BAFFLE_GAMES } from "@/lib/constants";
import { getTr } from "@/lib/admin-lang-server";
import type { Tr } from "@/lib/admin-lang";

async function run(fn: () => Promise<number>, label: (tr: Tr) => string): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  try {
    const n = await fn();
    refreshContent();
    return { ok: tr(`Đã lưu ${n} ${label(tr)}.`, `Saved ${n} ${label(tr)}.`) };
  } catch (e) {
    return { error: await errorMessage(e) };
  }
}

export async function saveBaffle(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const game = str(fd, "game");
  if (!BAFFLE_GAMES.some((g) => g.id === game)) return { error: (await getTr()).tr("Game không hợp lệ", "Invalid game") };
  type R = { location: string; clues: string[]; solution: string; slug: string; effect: string };
  const rows = cleanRows(json<R[]>(fd, "rows", []), "solution").map((r, i) => ({
    location: r.location ?? "",
    clues: r.clues ?? [],
    solution: r.solution,
    slug: r.slug ? slugify(r.slug) : "",
    effect: r.effect ?? "",
    game,
    sortOrder: i,
  }));
  return run(async () => {
    await prisma.$transaction([prisma.baffleBoard.deleteMany({ where: { game } }), prisma.baffleBoard.createMany({ data: rows })]);
    return rows.length;
  }, (tr) => tr("câu đố", "puzzles"));
}

export async function saveSouls(_prev: ActionState, fd: FormData): Promise<ActionState> {
  type R = {
    soul1Name: string;
    soul1Slug: string;
    soul1Image: string;
    soul2Name: string;
    soul2Slug: string;
    soul2Image: string;
    resultName: string;
    resultImage: string;
    description: string;
  };
  const rows = cleanRows(json<R[]>(fd, "rows", []), "resultName").map((r, i) => ({ ...r, sortOrder: i }));
  return run(async () => {
    await prisma.$transaction([prisma.specialSoul.deleteMany(), prisma.specialSoul.createMany({ data: rows })]);
    return rows.length;
  }, (tr) => tr("công thức", "recipes"));
}

export async function saveAttitudes(_prev: ActionState, fd: FormData): Promise<ActionState> {
  type R = { name: string; stats: string; preference: string; book: string };
  const rows = cleanRows(json<R[]>(fd, "rows", []), "name").map((r, i) => ({ ...r, sortOrder: i }));
  return run(async () => {
    await prisma.$transaction([prisma.attitude.deleteMany(), prisma.attitude.createMany({ data: rows })]);
    return rows.length;
  }, (tr) => tr("attitude", "attitudes"));
}

export async function saveChangelog(_prev: ActionState, fd: FormData): Promise<ActionState> {
  type R = { version: string; items: string[] };
  const rows = cleanRows(json<R[]>(fd, "rows", []), "version").map((r, i) => ({ ...r, sortOrder: i }));
  return run(async () => {
    await prisma.$transaction([prisma.changelog.deleteMany(), prisma.changelog.createMany({ data: rows })]);
    return rows.length;
  }, (tr) => tr("phiên bản", "versions"));
}
