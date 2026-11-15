"use client";

import Link from "next/link";
import { useQrScanned } from "@/lib/local-store";

/** Danh sách bộ QR của một loại coin, kèm số mã đã quét (lưu trên trình duyệt). */
export default function QrSetList({ category, sets }: { category: string; sets: { name: string; slug: string; total: number }[] }) {
  const [scanned] = useQrScanned();
  return (
    <ul>
      {sets.map((s) => {
        const done = (scanned[`${category}/${s.slug}`] ?? []).filter((i) => i < s.total).length;
        return (
          <li key={s.slug}>
            <Link href={`/qr-code/${category}/${s.slug}`} className="qr-set-link">
              <span>{s.name}</span>
              {done > 0 && (
                <span className={done >= s.total ? "qr-progress qr-progress-done" : "qr-progress"}>
                  {done >= s.total ? "✓ " : ""}
                  {done}/{s.total}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
