import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { ADMIN_BASE, DEFAULT_LOGIN_PATH, LOGIN_ROUTE, getLoginPath } from "@/lib/settings-store";

const notFound = (request: NextRequest) => NextResponse.rewrite(new URL("/__not-found", request.url));

/**
 * Khu quản trị: /dashboard/... Trang đăng nhập (route nội bộ /dashboard/login) chỉ hiện qua rewrite:
 * - Mặc định: chưa đăng nhập mở /dashboard -> hiện form; /dashboard/xxx -> chuyển về /dashboard?next=...
 * - Đường dẫn riêng (Admin › Cài đặt chung), vd /quan-tri: chỉ /quan-tri hiện form;
 *   /dashboard khi chưa đăng nhập trả 404 để ẩn trang quản trị.
 * - Đăng nhập xong luôn vào /dashboard/...
 * Kiểm tra lạc quan; mỗi trang/action admin vẫn tự gọi requireAdmin().
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loginPath = await getLoginPath();
  const custom = loginPath !== DEFAULT_LOGIN_PATH;
  const isAdmin = pathname === ADMIN_BASE || pathname.startsWith(ADMIN_BASE + "/") || pathname.startsWith("/api/admin/");

  // route nội bộ không bao giờ truy cập trực tiếp
  if (pathname === LOGIN_ROUTE) return notFound(request);

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (custom && pathname === loginPath) {
    if (session) return NextResponse.redirect(new URL(ADMIN_BASE, request.url));
    return NextResponse.rewrite(new URL(LOGIN_ROUTE + search, request.url));
  }
  if (!isAdmin) return NextResponse.next();
  if (session) return NextResponse.next();

  // ---- chưa đăng nhập
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (custom) return notFound(request);
  if (pathname === ADMIN_BASE) return NextResponse.rewrite(new URL(LOGIN_ROUTE + search, request.url));
  const url = new URL(ADMIN_BASE, request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // mọi trang trừ file tĩnh (cần bắt cả đường dẫn đăng nhập tuỳ chỉnh)
  matcher: ["/((?!_next/|img/|fonts/|uploads/|favicon\\.ico|robots\\.txt|logo\\d+\\.png).*)"],
};
