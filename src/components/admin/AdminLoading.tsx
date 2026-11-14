"use client";

import { useTr } from "./AdminLang";

/** Khung chờ khi chuyển trang trong admin (giúp điều hướng hiển thị ngay). */
export default function AdminLoading() {
  const { tr } = useTr();
  return (
    <div aria-busy="true">
      <div className="a-page-head">
        <div>
          <h1 style={{ color: "var(--a-muted)" }}>{tr("Đang tải...", "Loading...")}</h1>
        </div>
      </div>
      <div className="a-card" style={{ height: 220, opacity: 0.6 }} />
    </div>
  );
}
