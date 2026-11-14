"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, bool, errorMessage, int, json, refreshContent, slugify, str } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";
import { emptyMoveset, type Evolution, type Fusion, type Moveset } from "@/lib/types";

function parse(fd: FormData) {
  const name = str(fd, "name");
  const evolution = json<Evolution>(fd, "evolution", null);
  const fusions = json<Fusion[]>(fd, "fusions", []).filter((f) => f.a.name || f.b.name || f.result.name);
  const game = int(fd, "game");
  return {
    game: [1, 2, 3].includes(game) ? game : 3,
    number: str(fd, "number"),
    name,
    slug: slugify(str(fd, "slug") || name),
    rank: str(fd, "rank"),
    tribe: str(fd, "tribe"),
    attribute: str(fd, "attribute"),
    color: str(fd, "color") || "#E85A3D",
    image: str(fd, "image"),
    foodSlug: str(fd, "foodSlug"),
    hp: int(fd, "hp"),
    str: int(fd, "str"),
    spr: int(fd, "spr"),
    def: int(fd, "def"),
    spd: int(fd, "spd"),
    profile: str(fd, "profile")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    evolution: evolution && (evolution.from.name || evolution.to.name) ? evolution : undefined,
    fusions,
    moveset: { ...emptyMoveset(), ...json<Moveset>(fd, "moveset", emptyMoveset()) },
    published: bool(fd, "published"),
  };
}

export async function saveYokai(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const data = parse(fd);
  if (!data.number || !data.name || !data.slug) return { error: tr("Cần nhập Số thứ tự, Tên và Slug.", "Please enter Number, Name and Slug.") };
  let createdId: number | null = null;
  const payload = { ...data, evolution: data.evolution ?? Prisma.DbNull };
  try {
    if (id) {
      await prisma.yokai.update({ where: { id }, data: payload });
    } else {
      const y = await prisma.yokai.create({ data: payload });
      createdId = y.id;
    }
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  refreshContent();
  if (createdId) redirect(`/dashboard/yokai/${createdId}?created=1`);
  return { ok: tr("Đã lưu Yo-kai.", "Yo-kai saved.") };
}

export async function deleteYokai(id: number) {
  await requireAdmin();
  await prisma.yokai.delete({ where: { id } });
  refreshContent();
  redirect("/dashboard/yokai");
}

