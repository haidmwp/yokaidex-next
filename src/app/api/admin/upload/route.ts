import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR } from "@/lib/uploads";
import { slugify } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";

export async function POST(request: Request) {
  if (!(await getCurrentUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const { tr } = await getTr();
  if (!(file instanceof File)) return Response.json({ error: tr("Không có file", "No file") }, { status: 400 });
  const ext = path.extname(file.name).toLowerCase();
  if (!IMAGE_TYPES[ext]) return Response.json({ error: tr("Chỉ hỗ trợ ảnh png, jpg, webp, gif, avif, ico", "Only png, jpg, webp, gif, avif and ico images are supported") }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: tr("File tối đa 5MB", "Maximum file size is 5MB") }, { status: 400 });

  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const base = slugify(path.basename(file.name, ext)) || "image";
  const name = `${base}-${crypto.randomBytes(3).toString("hex")}${ext}`;
  const dir = path.join(UPLOAD_DIR, sub);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return Response.json({ url: `/uploads/${sub}/${name}` });
}
