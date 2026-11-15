// Chạy 1 lần khi server Node khởi động: tự sao lưu database mỗi ngày (xem src/lib/backups.ts).
// Trên hosting app tự thoát khi rảnh và khởi động lại khi có truy cập -> kiểm tra lúc khởi động
// là đủ; thêm hẹn giờ mỗi giờ cho trường hợp app chạy liên tục qua ngày mới.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { ensureDailyBackup } = await import("./lib/backups");
  const run = () =>
    ensureDailyBackup()
      .then((name) => name && console.log(`[backup] created ${name}`))
      .catch((e) => console.error("[backup] failed:", e));
  setTimeout(run, 15_000).unref();
  setInterval(run, 60 * 60 * 1000).unref();
}
