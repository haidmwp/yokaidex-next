import AdminForm from "@/components/admin/AdminForm";
import { ImageField, TextField } from "@/components/admin/Fields";
import Tabs from "@/components/admin/Tabs";
import { prisma } from "@/lib/prisma";
import { getTr } from "@/lib/admin-lang-server";
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
  const [s, counts, { tr, lang, locale }] = await Promise.all([readGeneralSettings(), sitemapCounts(), getTr()]);
  const en = lang === "en";
  const custom = s.loginPath !== DEFAULT_LOGIN_PATH;
  const sitemapUrl = `${s.siteUrl}/sitemap_index.xml`;
  const total = s.sitemapSections.reduce((n, id) => n + (counts[id] ?? 0), 0);

  const general = (
    <div className="a-card">
      <h2>{tr("Tiêu đề trên tab trình duyệt", "Browser tab title")}</h2>
      <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <TextField
          name="siteTitle"
          label={tr("Tiêu đề website", "Website title")}
          defaultValue={s.siteTitle}
          placeholder={DEFAULT_SETTINGS.siteTitle}
          hint={tr(
            'Trang chủ hiển thị đúng tiêu đề này; các trang khác hiển thị "Tên trang | Tiêu đề website", vd. "Medallium | …".',
            'The home page shows exactly this title; other pages show "Page name | Website title", e.g. "Medallium | …".',
          )}
        />
        <TextField
          name="siteUrl"
          label={tr("Địa chỉ website", "Website URL")}
          defaultValue={s.siteUrl}
          placeholder={DEFAULT_SETTINGS.siteUrl}
          hint={tr(
            "Tên miền chính thức (có https://). Dùng cho sitemap, robots.txt và thẻ chia sẻ mạng xã hội.",
            "The official domain (with https://). Used for the sitemap, robots.txt and social sharing tags.",
          )}
        />
      </div>

      <h2 style={{ marginTop: 24 }}>Favicon</h2>
      <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <ImageField
          name="favicon"
          pickOnClick
          clearable
          label={tr("Biểu tượng trên tab trình duyệt", "Browser tab icon")}
          defaultValue={s.favicon}
          hint={tr(
            "Bấm Upload để tải ảnh lên (nên dùng ảnh vuông PNG 512×512, hoặc file .ico). Để trống để dùng favicon mặc định. Trình duyệt có thể cần tải lại trang (Ctrl+F5) mới thấy icon mới.",
            "Click Upload to upload an image (a square 512×512 PNG or an .ico file is recommended). Leave empty to use the default favicon. Browsers may need a hard reload (Ctrl+F5) to show the new icon.",
          )}
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
          <input type="checkbox" name="sitemapEnabled" defaultChecked={s.sitemapEnabled} />{" "}
          {tr("Bật sitemap (/sitemap_index.xml – kiểu Yoast SEO)", "Enable sitemap (/sitemap_index.xml – Yoast SEO style)")}
        </label>
        <p className="a-label" style={{ margin: "16px 0 8px" }}>
          {tr("Nhóm trang đưa vào sitemap", "Page groups included in the sitemap")}
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {SITEMAP_SECTIONS.map((sec) => (
            <label key={sec.id} className="a-check" style={{ fontWeight: 400 }}>
              <input type="checkbox" name="sitemapSections" value={sec.id} defaultChecked={s.sitemapSections.includes(sec.id)} />
              {en ? sec.labelEn : sec.label} <span className="a-hint">({(counts[sec.id] ?? 0).toLocaleString(locale)} URL)</span>
            </label>
          ))}
        </div>
        <Status on={s.sitemapEnabled}>
          {s.sitemapEnabled ? (
            <>
              {tr("Sitemap đang bật:", "Sitemap is on:")} <b>{total.toLocaleString(locale)}</b> URL ·{" "}
              <a href="/sitemap_index.xml" target="_blank" rel="noreferrer">
                {tr("Xem sitemap ↗", "View sitemap ↗")}
              </a>{" "}
              ·{" "}
              <a href="/robots.txt" target="_blank" rel="noreferrer">
                robots.txt ↗
              </a>
              <br />
              {tr("Địa chỉ nộp lên Search Console:", "URL to submit to Search Console:")} <code>{sitemapUrl}</code>
            </>
          ) : (
            <>
              {tr(
                "Sitemap đang tắt – các file sitemap trả về 404 và robots.txt không trỏ tới sitemap.",
                "Sitemap is off – sitemap files return 404 and robots.txt does not point to a sitemap.",
              )}
            </>
          )}
        </Status>
      </div>

      <div className="a-card">
        <h2>Google Search Console</h2>
        <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
          <TextField
            name="gscVerification"
            label={tr("Mã xác minh (thẻ HTML)", "Verification code (HTML tag)")}
            defaultValue={s.gscVerification}
            placeholder={tr('<meta name="google-site-verification" content="..."> hoặc chỉ phần mã', '<meta name="google-site-verification" content="..."> or just the code')}
            hint={tr(
              "Dán nguyên thẻ meta Google đưa hoặc chỉ phần content. Website sẽ tự chèn thẻ này vào trang chủ.",
              "Paste the whole meta tag from Google or just its content. The website inserts this tag into the home page.",
            )}
          />
        </div>
        <Status on={!!s.gscVerification}>
          {s.gscVerification
            ? tr("Đã gắn thẻ xác minh Search Console.", "Search Console verification tag is set.")
            : tr("Chưa có mã xác minh.", "No verification code yet.")}
        </Status>
        <div className="a-hint" style={{ marginTop: 12, lineHeight: 1.7 }}>
          {en ? (
            <>
              <b>How to submit the sitemap:</b>
              <br />
              1. Go to <b>search.google.com/search-console</b> › Add property › choose <b>URL prefix</b> › enter <code>{s.siteUrl}</code>.
              <br />
              2. Choose the <b>HTML tag</b> verification method, copy the meta tag into the field above › <b>Save settings</b> › back in Search Console click{" "}
              <b>Verify</b>.
              <br />
              3. Open <b>Sitemaps</b> › enter <code>sitemap_index.xml</code> › <b>Submit</b>.
              <br />
              (If the domain is already verified via DNS or Google Analytics, skip step 2.) The website must be live on its real domain for Google to read it.
            </>
          ) : (
            <>
              <b>Cách nộp sitemap:</b>
              <br />
              1. Vào <b>search.google.com/search-console</b> › Thêm thuộc tính › chọn <b>Tiền tố URL</b> › nhập <code>{s.siteUrl}</code>.
              <br />
              2. Chọn cách xác minh <b>Thẻ HTML</b>, chép thẻ meta dán vào ô trên › <b>Lưu cài đặt</b> › quay lại Search Console bấm <b>Xác minh</b>.
              <br />
              3. Vào mục <b>Sơ đồ trang web</b> › nhập <code>sitemap_index.xml</code> › <b>Gửi</b>.
              <br />
              (Nếu đã xác minh tên miền bằng DNS hoặc Google Analytics thì bỏ qua bước 2.) Website phải đang chạy trên tên miền thật thì Google mới đọc được.
            </>
          )}
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
          hint={tr(
            "Lấy trong Google Analytics › Quản trị › Luồng dữ liệu › Web. Để trống để tắt theo dõi. Chỉ áp dụng cho website public, không gắn vào trang quản trị.",
            "Find it in Google Analytics › Admin › Data streams › Web. Leave empty to disable tracking. Applies to the public website only, not the admin.",
          )}
        />
      </div>
      <Status on={!!s.gaId}>
        {s.gaId ? (
          <>
            {tr("Đang theo dõi bằng", "Tracking with")} <b>{s.gaId}</b>.{" "}
            {tr("Mỗi lần chuyển trang đều gửi một", "Every page change sends a")} <code>page_view</code>.
          </>
        ) : (
          <>{tr("Google Analytics đang tắt.", "Google Analytics is off.")}</>
        )}
      </Status>
      <p className="a-hint" style={{ marginBottom: 0 }}>
        {tr(
          "Website tự gửi page_view khi chuyển trang. Trong GA4 › Luồng dữ liệu › Đo lường nâng cao, nên tắt mục “Thay đổi trang dựa trên sự kiện lịch sử trình duyệt” để không bị đếm trùng.",
          "The website sends page_view on every page change. In GA4 › Data streams › Enhanced measurement, turn off “Page changes based on browser history events” to avoid double counting.",
        )}
      </p>
    </div>
  );

  const ads = (
    <div className="a-card">
      <h2>{tr("Quảng cáo", "Ads")}</h2>
      <div className="a-field">
        <label htmlFor="adCode">{tr("Mã quảng cáo (HTML / script)", "Ad code (HTML / script)")}</label>
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
          {tr(
            "Dán nguyên mã do mạng quảng cáo cung cấp (AdSense, Adsterra…). Có mã thì website hiện một thanh quảng cáo cố định dưới chân trang (người xem có thể ẩn/hiện); để trống để tắt. Không áp dụng cho trang quản trị. Thanh cao vừa khít banner; banner rộng hơn màn hình (vd. 728×90 trên điện thoại) được tự thu nhỏ cho vừa, không bị cắt.",
            "Paste the code from your ad network (AdSense, Adsterra…) as-is. With a code, the website shows a fixed ad bar at the bottom (visitors can hide/show it); leave empty to disable. Not applied to the admin. The bar fits the banner height; banners wider than the screen (e.g. 728×90 on phones) are scaled down to fit instead of being cut off.",
          )}
        </span>
      </div>
      <Status on={!!s.adCode}>
        {s.adCode ? tr("Thanh quảng cáo đang bật.", "The ad bar is on.") : tr("Chưa có mã quảng cáo – thanh quảng cáo đang tắt.", "No ad code – the ad bar is off.")}
      </Status>

      <h2 style={{ marginTop: 28 }}>{tr("Chặn quảng cáo (AdBlock)", "Ad blockers (AdBlock)")}</h2>
      <input type="hidden" name="_ads" value="1" />
      <label className="a-check">
        <input type="checkbox" name="adblockWarning" defaultChecked={s.adblockWarning} />{" "}
        {tr("Hiện popup cảnh báo khi người xem bật trình chặn quảng cáo", "Show a warning popup when a visitor uses an ad blocker")}
      </label>
      <p className="a-hint" style={{ marginBottom: 0 }}>
        {tr(
          "Khi phát hiện AdBlock, uBlock Origin, AdGuard… website hiện popup che trang, chỉ đóng được sau khi người xem tắt trình chặn quảng cáo cho website rồi bấm kiểm tra lại. Chỉ hoạt động khi đã có mã quảng cáo ở trên.",
          "When AdBlock, uBlock Origin, AdGuard… is detected, the website shows a popup covering the page that only closes after the visitor disables the ad blocker for the site and re-checks. Only works when an ad code is set above.",
        )}
      </p>
    </div>
  );

  const login = (
    <div className="a-card">
      <h2>{tr("Đường dẫn đăng nhập admin", "Admin login path")}</h2>
      <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
        <TextField
          name="loginPath"
          label={tr("Đường dẫn", "Path")}
          defaultValue={s.loginPath}
          placeholder={DEFAULT_LOGIN_PATH}
          hint={tr(
            `Chỉ 1 cấp (không có / ở giữa). Để trống hoặc ${DEFAULT_LOGIN_PATH} để dùng mặc định. Đường dẫn riêng gồm chữ thường, số, gạch ngang, vd. /quan-tri-yokaidex. Sau khi đăng nhập luôn vào ${DEFAULT_LOGIN_PATH}/...`,
            `One level only (no / in the middle). Leave empty or ${DEFAULT_LOGIN_PATH} for the default. A custom path uses lowercase letters, digits and hyphens, e.g. /yokaidex-manager. After logging in you always land on ${DEFAULT_LOGIN_PATH}/...`,
          )}
        />
      </div>
      <Status on={custom}>
        {custom ? (
          en ? (
            <>
              Using the custom path <b>{s.loginPath}</b>. When not logged in, <code>{DEFAULT_LOGIN_PATH}/…</code> pages return 404 to hide the admin; after
              logging in you still go to <code>{DEFAULT_LOGIN_PATH}</code>.
            </>
          ) : (
            <>
              Đang dùng đường dẫn riêng <b>{s.loginPath}</b>. Các trang <code>{DEFAULT_LOGIN_PATH}/…</code> khi chưa đăng nhập sẽ báo 404 để ẩn trang quản
              trị; đăng nhập xong vẫn vào <code>{DEFAULT_LOGIN_PATH}</code>.
            </>
          )
        ) : en ? (
          <>
            Using the default path <b>{DEFAULT_LOGIN_PATH}</b>: when not logged in, it shows the login form. A custom path helps hide the admin from strangers.
          </>
        ) : (
          <>
            Đang dùng đường dẫn mặc định <b>{DEFAULT_LOGIN_PATH}</b>: chưa đăng nhập thì hiện form đăng nhập. Đặt đường dẫn riêng giúp ẩn trang quản trị
            khỏi người lạ.
          </>
        )}
      </Status>
      <p className="a-hint" style={{ marginBottom: 0 }}>
        {en ? (
          <>
            ⚠ Remember the new path before logging out. If you forget it, you can reset it by deleting the <code>general</code> row in the{" "}
            <code>Setting</code> table (e.g. via <code>npm run db:studio</code>).
          </>
        ) : (
          <>
            ⚠ Hãy ghi nhớ đường dẫn mới trước khi đăng xuất. Nếu quên, có thể khôi phục bằng cách xoá dòng <code>general</code> trong bảng{" "}
            <code>Setting</code> (vd. qua <code>npm run db:studio</code>).
          </>
        )}
      </p>
    </div>
  );

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{tr("Cài đặt chung", "General settings")}</h1>
          <p>{tr("Cấu hình áp dụng cho toàn website", "Settings that apply to the whole website")}</p>
        </div>
      </div>
      <AdminForm action={saveGeneralSettings} submitLabel={tr("Lưu cài đặt", "Save settings")}>
        <Tabs
          tabs={[
            { id: "general", label: tr("Chung", "General"), content: general },
            { id: "seo", label: "SEO & Sitemap", content: seo },
            { id: "analytics", label: "Google Analytics", content: analytics },
            { id: "ads", label: tr("Quảng cáo", "Ads"), content: ads },
            { id: "login", label: tr("Đăng nhập admin", "Admin login"), content: login },
          ]}
        />
      </AdminForm>
    </>
  );
}
