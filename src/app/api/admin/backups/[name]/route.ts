import fs from "node:fs/promises";
import { getCurrentUser } from "@/lib/auth";
import { backupPath } from "@/lib/backups";

/** Tải một bản sao lưu database (chỉ admin). */
export async function GET(_req: Request, ctx: RouteContext<"/api/admin/backups/[name]">) {
  if (!(await getCurrentUser())) return new Response("Unauthorized", { status: 401 });
  const { name } = await ctx.params;
  const file = backupPath(name);
  const buf = file ? await fs.readFile(file).catch(() => null) : null;
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
