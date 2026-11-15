import DeleteButton from "@/components/admin/DeleteButton";
import { KEEP, listBackups } from "@/lib/backups";
import { getTr } from "@/lib/admin-lang-server";
import { backupNow, deleteBackup, refreshCache } from "./actions";

const size = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

export default async function MaintenancePage(props: PageProps<"/dashboard/maintenance">) {
  const sp = (await props.searchParams) as { done?: string; name?: string; error?: string };
  const { tr, locale } = await getTr();
  const backups = await listBackups();

  const notice =
    sp.done === "cache"
      ? tr("Đã làm mới cache. Trang public sẽ lấy dữ liệu mới ở lần truy cập tiếp theo.", "Cache refreshed. Public pages will load fresh data on the next visit.")
      : sp.done === "backup"
        ? tr(`Đã tạo bản sao lưu ${sp.name ?? ""}.`, `Backup ${sp.name ?? ""} created.`)
        : sp.done === "deleted"
          ? tr("Đã xoá bản sao lưu.", "Backup deleted.")
          : null;

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{tr("Bảo trì", "Maintenance")}</h1>
          <p>{tr("Làm mới cache và sao lưu database", "Refresh cache and back up the database")}</p>
        </div>
      </div>

      {notice && <div className="a-alert a-alert-ok">{notice}</div>}
      {sp.error && <div className="a-alert a-alert-err">{tr("Lỗi: ", "Error: ")}{sp.error}</div>}

      <div className="a-card">
        <h2>{tr("Cache website", "Website cache")}</h2>
        <p className="a-hint">
          {tr(
            "Trang public được cache để tải nhanh và tự làm mới mỗi khi lưu trong admin. Chỉ cần bấm nút này khi dữ liệu được sửa ngoài admin (chạy script, sửa thẳng database...) mà website chưa hiện nội dung mới.",
            "Public pages are cached for speed and refresh automatically whenever you save in the admin. Use this button only when data was changed outside the admin (scripts, direct database edits...) and the site still shows old content.",
          )}
        </p>
        <form action={refreshCache}>
          <button className="a-btn a-btn-primary">{tr("Làm mới cache", "Refresh cache")}</button>
        </form>
      </div>

      <div className="a-card">
        <div className="a-page-head" style={{ marginBottom: 8 }}>
          <div>
            <h2 style={{ margin: 0 }}>{tr("Sao lưu database", "Database backups")}</h2>
            <p>
              {tr(
                `Tự động sao lưu mỗi ngày một lần, giữ ${KEEP} bản mới nhất (tính cả bản tạo tay).`,
                `Backed up automatically once a day; the ${KEEP} newest copies are kept (manual ones included).`,
              )}
            </p>
          </div>
          <form action={backupNow}>
            <button className="a-btn">{tr("Sao lưu ngay", "Back up now")}</button>
          </form>
        </div>
        {backups.length === 0 ? (
          <p className="a-hint">{tr("Chưa có bản sao lưu nào.", "No backups yet.")}</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>{tr("File", "File")}</th>
                  <th>{tr("Thời gian", "Time")}</th>
                  <th>{tr("Dung lượng", "Size")}</th>
                  <th>{tr("Loại", "Type")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.name}>
                    <td>
                      <code>{b.name}</code>
                    </td>
                    <td>{b.createdAt.toLocaleString(locale)}</td>
                    <td>{size(b.size)}</td>
                    <td>{b.manual ? tr("Tạo tay", "Manual") : tr("Tự động", "Automatic")}</td>
                    <td>
                      <form style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <a className="a-btn a-btn-sm" href={`/api/admin/backups/${b.name}`} download>
                          {tr("Tải về", "Download")}
                        </a>
                        <DeleteButton small action={deleteBackup.bind(null, b.name)} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
