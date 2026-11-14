import AdminForm from "@/components/admin/AdminForm";
import { TextField } from "@/components/admin/Fields";
import Tabs from "@/components/admin/Tabs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LOGIN_PATH, DEFAULT_SETTINGS, SITEMAP_SECTIONS, readGeneralSettings } from "@/lib/settings-store";
import { saveGeneralSettings } from "./actions";

function Status({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div className={on ? "a-alert a-alert-ok" : "a-alert"} style={{ marginTop: 14, marginBottom: 0, background: on ? undefined : "#f4f5f9" }}>
      {children}
    </div>
  );
}

/** Số URL của từng nhóm trong sitemap. */
async function sitemapCounts(): Promise<Record<string, number>> {
  const [y1, y2, y3, food, qrCat, qrSet, pw] = await Promise.all([
    prisma.yokai.count({ where: { game: 1, published: true } }),
    prisma.yokai.count({ where: { game: 2, published: true } }),
    prisma.yokai.count({ where: { game: 3, published: true } }),
    prisma.foodCategory.count(),
    prisma.qrCategory.count(),
    prisma.qrSet.count(),
    prisma.passwordRegion.count(),
  ]);
  return { pages: 17, yw1: y1, yw2: y2, yw3: y3, food, qr: qrCat + qrSet, password: pw };
}

export default async function SettingsPage() {
  const [s, counts] = await Promise.all([readGeneralSettings(), sitemapCounts()]);
  const custom = s.loginPath !== DEFAULT_LOGIN_PATH;
  const sitemapUrl = `${s.siteUrl}/sitemap_index.xml`;
  const total = s.sitemapSections.reduce((n, id) => n + (counts[id] ?? 0), 0);

  const general = (
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
        <TextField
          name="siteUrl"
          label="Địa chỉ website"
          defaultValue={s.siteUrl}
          placeholder={DEFAULT_SETTINGS.siteUrl}
          hint="Tên miền chính thức (có https://). Dùng cho sitemap, robots.txt và thẻ chia sẻ mạng xã hội."
        />
      </div>
    </div>
  );

  const seo = (
    <>
      <div className="a-card">
        <h2>Sitemap</h2>
        <input type="hidden" name="_seo" value="1" />
        <label className="a-check">
          <input type="checkbox" name="sitemapEnabled" defaultChecked={s.sitemapEnabled} /> Bật sitemap (/sitemap_index.xml – kiểu Yoast SEO)
        </label>
        <p className="a-label" style={{ margin: "16px 0 8px" }}>
          Nhóm trang đưa vào sitemap
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {SITEMAP_SECTIONS.map((sec) => (
            <label key={sec.id} className="a-check" style={{ fontWeight: 400 }}>
              <input type="checkbox" name="sitemapSections" value={sec.id} defaultChecked={s.sitemapSections.includes(sec.id)} />
              {sec.label} <span className="a-hint">({(counts[sec.id] ?? 0).toLocaleString("vi-VN")} URL)</span>
            </label>
          ))}
        </div>
        <Status on={s.sitemapEnabled}>
          {s.sitemapEnabled ? (
            <>
              Sitemap đang bật: <b>{total.toLocaleString("vi-VN")}</b> URL ·{" "}
              <a href="/sitemap_index.xml" target="_blank" rel="noreferrer">
                Xem sitemap ↗
              </a>{" "}
              ·{" "}
              <a href="/robots.txt" target="_blank" rel="noreferrer">
                robots.txt ↗
              </a>
              <br />
              Địa chỉ nộp lên Search Console: <code>{sitemapUrl}</code>
            </>
          ) : (
            <>Sitemap đang tắt – các file sitemap trả về 404 và robots.txt không trỏ tới sitemap.</>
          )}
        </Status>
      </div>

      <div className="a-card">
        <h2>Google Search Console</h2>
        <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
          <TextField
            name="gscVerification"
            label="Mã xác minh (thẻ HTML)"
            defaultValue={s.gscVerification}
            placeholder='<meta name="google-site-verification" content="..."> hoặc chỉ phần mã'
            hint="Dán nguyên thẻ meta Google đưa hoặc chỉ phần content. Website sẽ tự chèn thẻ này vào trang chủ."
          />
        </div>
        <Status on={!!s.gscVerification}>
          {s.gscVerification ? <>Đã gắn thẻ xác minh Search Console.</> : <>Chưa có mã xác minh.</>}
        </Status>
        <div className="a-hint" style={{ marginTop: 12, lineHeight: 1.7 }}>
          <b>Cách nộp sitemap:</b>
          <br />
          1. Vào <b>search.google.com/search-console</b> › Thêm thuộc tính › chọn <b>Tiền tố URL</b> › nhập <code>{s.siteUrl}</code>.
          <br />
          2. Chọn cách xác minh <b>Thẻ HTML</b>, chép thẻ meta dán vào ô trên › <b>Lưu cài đặt</b> › quay lại Search Console bấm <b>Xác minh</b>.
          <br />
          3. Vào mục <b>Sơ đồ trang web</b> › nhập <code>sitemap_index.xml</code> › <b>Gửi</b>.
          <br />
          (Nếu đã xác minh tên miền bằng DNS hoặc Google Analytics thì bỏ qua bước 2.) Website phải đang chạy trên tên miền thật thì Google mới đọc được.
        </div>
      </div>
    </>
  );

  const analytics = (
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
      <Status on={!!s.gaId}>
        {s.gaId ? (
          <>
            Đang theo dõi bằng <b>{s.gaId}</b>. Mỗi lần chuyển trang đều gửi một <code>page_view</code>.
          </>
        ) : (
          <>Google Analytics đang tắt.</>
        )}
      </Status>
      <p className="a-hint" style={{ marginBottom: 0 }}>
        Website tự gửi page_view khi chuyển trang. Trong GA4 › Luồng dữ liệu › Đo lường nâng cao, nên tắt mục “Thay đổi trang dựa trên sự kiện lịch sử trình
        duyệt” để không bị đếm trùng.
      </p>
    </div>
  );

  const ads = (
    <div className="a-card">
      <h2>Quảng cáo</h2>
      <div className="a-field">
        <label htmlFor="adCode">Mã quảng cáo (HTML / script)</label>
        <textarea
          id="adCode"
          name="adCode"
          className="a-code"
          rows={8}
          defaultValue={s.adCode}
          placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script>\n<ins class="adsbygoogle" ...></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
          spellCheck={false}
        />
        <span className="a-hint">
          Dán nguyên mã do mạng quảng cáo cung cấp (AdSense, Adsterra…). Có mã thì website hiện một thanh quảng cáo cố định dưới chân trang (người xem có
          thể đóng); để trống để tắt. Không áp dụng cho trang quản trị. Thanh cao 100px; banner rộng hơn màn hình (vd. 728×90 trên điện thoại) được tự thu nhỏ cho vừa, không bị cắt.
        </span>
      </div>
      <Status on={!!s.adCode}>{s.adCode ? <>Thanh quảng cáo đang bật.</> : <>Chưa có mã quảng cáo – thanh quảng cáo đang tắt.</>}</Status>
    </div>
  );

  const login = (
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
      <Status on={custom}>
        {custom ? (
          <>
            Đang dùng đường dẫn riêng <b>{s.loginPath}</b>. Các trang <code>{DEFAULT_LOGIN_PATH}/…</code> khi chưa đăng nhập sẽ báo 404 để ẩn trang quản trị;
            đăng nhập xong vẫn vào <code>{DEFAULT_LOGIN_PATH}</code>.
          </>
        ) : (
          <>
            Đang dùng đường dẫn mặc định <b>{DEFAULT_LOGIN_PATH}</b>: chưa đăng nhập thì hiện form đăng nhập. Đặt đường dẫn riêng giúp ẩn trang quản trị
            khỏi người lạ.
          </>
        )}
      </Status>
      <p className="a-hint" style={{ marginBottom: 0 }}>
        ⚠ Hãy ghi nhớ đường dẫn mới trước khi đăng xuất. Nếu quên, có thể khôi phục bằng cách xoá dòng <code>general</code> trong bảng <code>Setting</code>{" "}
        (vd. qua <code>npm run db:studio</code>).
      </p>
    </div>
  );

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Cài đặt chung</h1>
          <p>Cấu hình áp dụng cho toàn website</p>
        </div>
      </div>
      <AdminForm action={saveGeneralSettings} submitLabel="Lưu cài đặt">
        <Tabs
          tabs={[
            { id: "general", label: "Chung", content: general },
            { id: "seo", label: "SEO & Sitemap", content: seo },
            { id: "analytics", label: "Google Analytics", content: analytics },
            { id: "ads", label: "Quảng cáo", content: ads },
            { id: "login", label: "Đăng nhập admin", content: login },
          ]}
        />
      </AdminForm>
    </>
  );
}
