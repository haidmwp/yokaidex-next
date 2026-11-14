import Link from "next/link";
import { GA_RANGES, type GaDays, getGaRealtime, getGaReport } from "@/lib/ga";
import type { Tr } from "@/lib/admin-lang";
import { getTr } from "@/lib/admin-lang-server";

type Fmt = (n: number) => string;

function Delta({ cur, prev, tr, fmt }: { cur: number; prev: number; tr: Tr; fmt: Fmt }) {
  if (!prev) return <span className="a-delta">—</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={up ? "a-delta a-delta-up" : "a-delta a-delta-down"} title={tr(`Kỳ trước: ${fmt(prev)}`, `Previous period: ${fmt(prev)}`)}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

type Day = { key: string; label: string; date: string; views: number; users: number };

/** Biểu đồ cột lượt xem theo ngày (1 chuỗi – tiêu đề đã gọi tên, không cần chú giải). */
function DailyChart({ daily, tr, fmt }: { daily: Day[]; tr: Tr; fmt: Fmt }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  const step = Math.max(1, Math.ceil(daily.length / 8)); // tối đa ~8 nhãn trục X
  const dense = daily.length > 60; // 3 tháng: cột sát nhau, mảnh hơn
  return (
    <div className={dense ? "a-chart a-chart-dense" : "a-chart"} role="img" aria-label={tr(`Lượt xem theo ngày, cao nhất ${fmt(max)}`, `Daily page views, max ${fmt(max)}`)}>
      <div className="a-chart-grid">
        <span>{fmt(max)}</span>
        <span>{fmt(Math.round(max / 2))}</span>
        <span>0</span>
      </div>
      <div className="a-chart-bars">
        {daily.map((d, i) => (
          <div key={d.key} className="a-chart-col" tabIndex={dense ? -1 : 0} aria-label={tr(`${d.date}: ${fmt(d.views)} lượt xem, ${fmt(d.users)} người dùng`, `${d.date}: ${fmt(d.views)} views, ${fmt(d.users)} users`)}>
            <div className="a-chart-bar" style={{ height: `${(d.views / max) * 100}%` }} />
            <div className="a-chart-tip">
              <b>{d.date}</b>
              <span>{fmt(d.views)} {tr("lượt xem", "views")}</span>
              <span>{fmt(d.users)} {tr("người dùng", "users")}</span>
            </div>
            <span className="a-chart-x">{i % step === 0 || i === daily.length - 1 ? d.label : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function GaStats({ days }: { days: GaDays }) {
  const [report, realtime, { tr, locale }] = await Promise.all([getGaReport(days), getGaRealtime(), getTr()]);
  const fmt: Fmt = (n) => n.toLocaleString(locale);
  const rangeLabel = (r?: (typeof GA_RANGES)[number]) => (r ? tr(r.label, r.labelEn) : tr(`${days} ngày`, `${days} days`));

  const head = (
    <div className="a-page-head" style={{ marginBottom: 12 }}>
      <h2 style={{ margin: 0 }}>{tr("Thống kê truy cập (Google Analytics)", "Traffic stats (Google Analytics)")}</h2>
      <div className="a-toolbar" style={{ margin: 0, flexWrap: "wrap" }}>
        {GA_RANGES.map((r) => (
          <Link key={r.days} href={`/dashboard?range=${r.days}`} className={r.days === days ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"}>
            {rangeLabel(r)}
          </Link>
        ))}
      </div>
    </div>
  );

  if (report.status !== "ok") {
    return (
      <div className="a-card">
        {head}
        <p className="a-hint" style={{ margin: 0 }}>
          {report.status === "not-configured"
            ? tr(`Chưa kết nối: ${report.reason}`, `Not connected: ${report.reason}`)
            : tr(`Không lấy được số liệu: ${report.message}`, `Could not load data: ${report.message}`)}
        </p>
      </div>
    );
  }

  const { current: c, previous: p } = report;
  const cards = [
    { label: tr("Người dùng", "Users"), cur: c.users, prev: p.users },
    { label: tr("Lượt xem trang", "Page views"), cur: c.views, prev: p.views },
    { label: tr("Phiên truy cập", "Sessions"), cur: c.sessions, prev: p.sessions },
  ];

  return (
    <div className="a-card">
      {head}
      <div className="a-stats" style={{ marginBottom: 16 }}>
        <div className="a-stat a-stat-live">
          <b>{realtime === null ? "—" : fmt(realtime)}</b>
          <span>
            <i className="a-live-dot" /> {tr("Đang online (30 phút)", "Online now (30 min)")}
          </span>
        </div>
        {cards.map((k) => (
          <div key={k.label} className="a-stat">
            <b>{fmt(k.cur)}</b>
            <span>
              {k.label} <Delta cur={k.cur} prev={k.prev} tr={tr} fmt={fmt} />
            </span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 14 }}>{tr("Lượt xem theo ngày", "Daily page views")}</h2>
      <DailyChart daily={report.daily} tr={tr} fmt={fmt} />

      <h2 style={{ fontSize: 14, marginTop: 20 }}>{tr("Trang được xem nhiều nhất", "Most viewed pages")}</h2>
      {report.topPages.length === 0 ? (
        <p className="a-hint">{tr("Chưa có dữ liệu.", "No data yet.")}</p>
      ) : (
        <table className="a-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{tr("Trang", "Page")}</th>
              <th className="a-right">{tr("Lượt xem", "Views")}</th>
            </tr>
          </thead>
          <tbody>
            {report.topPages.map((t, i) => (
              <tr key={t.path + i}>
                <td>{i + 1}</td>
                <td>
                  <a href={t.path} target="_blank" rel="noreferrer">
                    {t.title.split(" | ")[0] || t.path}
                  </a>
                  <div className="a-hint">{t.path}</div>
                </td>
                <td className="a-right">{fmt(t.views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="a-hint" style={{ margin: "10px 0 0" }}>
        {tr(
          `So sánh với ${rangeLabel(GA_RANGES.find((r) => r.days === days))} trước đó · cập nhật mỗi giờ · lần lấy gần nhất ${new Date(report.fetchedAt).toLocaleString(locale)}`,
          `Compared with the previous ${rangeLabel(GA_RANGES.find((r) => r.days === days))} · updated hourly · last fetched ${new Date(report.fetchedAt).toLocaleString(locale)}`,
        )}
      </p>
    </div>
  );
}
