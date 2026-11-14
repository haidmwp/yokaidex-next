import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifySession } from "./session";
import { getLoginPath } from "./settings-store";

/**
 * Đọc cookie phiên từ header `Cookie` của request.
 * (Không dùng cookies(): Next.js 16 ném InvariantError khi render lại trang sau một server action
 * được gửi bằng form thường – trường hợp JS chưa kịp hydrate.)
 */
async function sessionToken() {
  const raw = (await headers()).get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === SESSION_COOKIE) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

/** Lấy user admin hiện tại (hoặc null). */
export async function getCurrentUser() {
  const session = await verifySession(await sessionToken());
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, username: true, email: true, name: true },
  });
}

/** Bắt buộc đăng nhập – dùng ở đầu mọi server action / trang admin. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect(await getLoginPath());
  return user;
}
