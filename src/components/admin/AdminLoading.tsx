/** Khung chờ khi chuyển trang trong admin (giúp điều hướng hiển thị ngay). */
export default function AdminLoading() {
  return (
    <div aria-busy="true">
      <div className="a-page-head">
        <div>
          <h1 style={{ color: "var(--a-muted)" }}>Đang tải...</h1>
        </div>
      </div>
      <div className="a-card" style={{ height: 220, opacity: 0.6 }} />
    </div>
  );
}
