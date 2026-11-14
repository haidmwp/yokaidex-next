import AdminForm from "@/components/admin/AdminForm";
import { TextField } from "@/components/admin/Fields";
import { DEFAULT_LOGIN_PATH, DEFAULT_SETTINGS, readGeneralSettings } from "@/lib/settings-store";
import { saveGeneralSettings } from "./actions";

export default async function SettingsPage() {
  const s = await readGeneralSettings();
  const custom = s.loginPath !== DEFAULT_LOGIN_PATH;
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Cài đặt chung</h1>
          <p>Cấu hình áp dụng cho toàn website</p>
        </div>
      </div>
      <AdminForm action={saveGeneralSettings} submitLabel="Lưu cài đặt">
        <div className="a-card">
          <h2>Tiêu đề trên tab trình duyệt</h2>
          <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <TextField
              name="siteTitle"
              label="Tiêu đề website"
              defaultValue={s.siteTitle}
              placeholder={DEFAULT_SETTINGS.siteTitle}
              hint='Trang chủ hiển thị đúng tiêu đề này; các trang khác hiển thị "Tên trang | Tiêu đề website", vd. "Medallium | …".'
            />
          </div>
        </div>
        <div className="a-card">
          <h2>Google Analytics</h2>
          <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <TextField
              name="gaId"
              label="Measurement ID (GA4)"
              defaultValue={s.gaId}
              placeholder="G-XXXXXXXXXX"
              hint="Lấy trong Google Analytics › Quản trị › Luồng dữ liệu › Web. Để trống để tắt theo dõi. Chỉ áp dụng cho website public, không gắn vào trang quản trị."
            />
          </div>
          <div className={s.gaId ? "a-alert a-alert-ok" : "a-alert"} style={{ marginTop: 14, marginBottom: 0, background: s.gaId ? undefined : "#f4f5f9" }}>
            {s.gaId ? (
              <>
                Đang theo dõi bằng <b>{s.gaId}</b>. Mỗi lần chuyển trang đều gửi một <code>page_view</code>.
              </>
            ) : (
              <>Google Analytics đang tắt.</>
            )}
          </div>
          <p className="a-hint" style={{ marginBottom: 0 }}>
            Website tự gửi page_view khi chuyển trang. Trong GA4 › Luồng dữ liệu › Đo lường nâng cao, nên tắt mục “Thay đổi trang dựa trên sự kiện lịch sử
            trình duyệt” để không bị đếm trùng.
          </p>
        </div>
        <div className="a-card">
          <h2>Đường dẫn đăng nhập admin</h2>
          <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <TextField
              name="loginPath"
              label="Đường dẫn"
              defaultValue={s.loginPath}
              placeholder={DEFAULT_LOGIN_PATH}
              hint={`Chỉ 1 cấp (không có / ở giữa). Để trống hoặc ${DEFAULT_LOGIN_PATH} để dùng mặc định. Đường dẫn riêng gồm chữ thường, số, gạch ngang, vd. /quan-tri-yokaidex. Sau khi đăng nhập luôn vào ${DEFAULT_LOGIN_PATH}/...`}
            />
          </div>
          <div className={custom ? "a-alert a-alert-ok" : "a-alert"} style={{ marginTop: 14, marginBottom: 0, background: custom ? undefined : "#f4f5f9" }}>
            {custom ? (
              <>
                Đang dùng đường dẫn riêng <b>{s.loginPath}</b>. Các trang <code>{DEFAULT_LOGIN_PATH}/…</code> khi chưa đăng nhập sẽ báo 404 để ẩn trang
                quản trị; đăng nhập xong vẫn vào <code>{DEFAULT_LOGIN_PATH}</code>.
              </>
            ) : (
              <>
                Đang dùng đường dẫn mặc định <b>{DEFAULT_LOGIN_PATH}</b>: chưa đăng nhập thì hiện form đăng nhập. Đặt đường dẫn riêng giúp ẩn trang
                quản trị khỏi người lạ.
              </>
            )}
          </div>
          <p className="a-hint" style={{ marginBottom: 0 }}>
            ⚠ Hãy ghi nhớ đường dẫn mới trước khi đăng xuất. Nếu quên, có thể khôi phục bằng cách xoá dòng <code>general</code> trong bảng{" "}
            <code>Setting</code> (vd. qua <code>npm run db:studio</code>).
          </p>
        </div>
      </AdminForm>
    </>
  );
}
