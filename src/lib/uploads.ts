import path from "node:path";

/** Thư mục lưu file upload (ngoài /public để phục vụ được cả sau khi build). */
export const UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));

export const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
