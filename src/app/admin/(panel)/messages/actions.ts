"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleRead(id: number, read: boolean) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

export async function markAllRead() {
  await requireAdmin();
  await prisma.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin", "layout");
}
