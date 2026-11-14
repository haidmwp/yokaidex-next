"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ActionState, errorMessage, str } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";
import type { Tr } from "@/lib/admin-lang";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// chữ thường, số, dấu chấm, gạch dưới, gạch ngang; 3–32 ký tự; không chứa @
const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
// tên dễ đoán, hay bị dò mật khẩu
const RESERVED_USERNAMES = ["admin", "administrator", "root", "superadmin", "sysadmin"];

/** Đọc & kiểm tra username/email từ form. username rỗng => null. */
function readIdentity(fd: FormData, tr: Tr): { username: string | null; email: string } | { error: string } {
  const username = str(fd, "username").toLowerCase();
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: tr("Email không hợp lệ.", "Invalid email.") };
  if (username && !USERNAME_RE.test(username)) {
    return {
      error: tr(
        "Username 3–32 ký tự, chỉ gồm chữ thường, số, dấu chấm, gạch dưới, gạch ngang.",
        "Username must be 3–32 characters: lowercase letters, digits, dots, underscores, hyphens.",
      ),
    };
  }
  if (username && RESERVED_USERNAMES.includes(username)) {
    return {
      error: tr(
        `Không được dùng username "${username}" – tên này quá dễ đoán. Hãy chọn tên khác.`,
        `Username "${username}" is not allowed – it is too easy to guess. Please choose another.`,
      ),
    };
  }
  return { username: username || null, email };
}

export async function createUser(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const { tr } = await getTr();
  const id = readIdentity(fd, tr);
  if ("error" in id) return id;
  const name = str(fd, "name");
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: tr("Mật khẩu tối thiểu 8 ký tự.", "Password must be at least 8 characters.") };
  try {
    await prisma.user.create({ data: { ...id, name, passwordHash: await bcrypt.hash(password, 10) } });
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: tr(`Đã tạo tài khoản ${id.username ?? id.email}.`, `Created account ${id.username ?? id.email}.`) };
}

/** Sửa username / email / tên hiển thị của chính mình. */
export async function updateProfile(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const { tr } = await getTr();
  const id = readIdentity(fd, tr);
  if ("error" in id) return id;
  try {
    await prisma.user.update({ where: { id: me.id }, data: { ...id, name: str(fd, "name") } });
  } catch (e) {
    return { error: await errorMessage(e) };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: tr("Đã cập nhật thông tin tài khoản.", "Account details updated.") };
}

export async function changePassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const { tr } = await getTr();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { error: tr("Mật khẩu hiện tại không đúng.", "Current password is incorrect.") };
  if (next.length < 8) return { error: tr("Mật khẩu mới tối thiểu 8 ký tự.", "New password must be at least 8 characters.") };
  if (next !== confirm) return { error: tr("Xác nhận mật khẩu không khớp.", "Password confirmation does not match.") };
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  return { ok: tr("Đã đổi mật khẩu.", "Password changed.") };
}

export async function deleteUser(id: number) {
  const me = await requireAdmin();
  if (id === me.id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/users");
}
