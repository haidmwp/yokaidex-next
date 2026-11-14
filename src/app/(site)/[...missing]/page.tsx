import { notFound } from "next/navigation";

// Bắt mọi URL không khớp để hiển thị trang 404 trong layout của site.
export default function CatchAll() {
  notFound();
}
