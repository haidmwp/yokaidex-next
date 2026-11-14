"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, errorMessage, str } from "@/lib/admin";

export async function createUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const password = String(fd.get("password") ?? "");
  if (!email || password.length < 8) return { error: "Cần email và mật khẩu tối thiểu 8 ký tự." };
  try {
    await prisma.user.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 10) } });
  } catch (e) {
    return { error: errorMessage(e) };
  }
  revalidatePath("/admin/users");
  return { ok: `Đã tạo tài khoản ${email}.` };
}

export async function changePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: "Mật khẩu hiện tại không đúng." };
  if (next.length < 8) return { error: "Mật khẩu mới tối thiểu 8 ký tự." };
  if (next !== confirm) return { error: "Xác nhận mật khẩu không khớp." };
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: "Đã đổi mật khẩu." };
}

export async function deleteUser(id: number) {
  const me = await requireAdmin();
  if (id === me.id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
