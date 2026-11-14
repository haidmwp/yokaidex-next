"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { getLoginPath } from "@/lib/settings-store";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  // Đăng nhập bằng username hoặc email
  const identifier = String(fd.get("identifier") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");
  const user = identifier
    ? await prisma.user.findFirst({ where: identifier.includes("@") ? { email: identifier } : { username: identifier } })
    : null;
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Tên đăng nhập/email hoặc mật khẩu không đúng." };
  }
  const token = await signSession({ uid: user.id, email: user.email });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  redirect(next.startsWith("/dashboard") && !next.startsWith("//") ? next : "/dashboard");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect(await getLoginPath());
}
