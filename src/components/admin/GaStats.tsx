import Link from "next/link";
import { getGaRealtime, getGaReport } from "@/lib/ga";

const fmt = (n: number) => n.toLocaleString("vi-VN");

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return <span className="a-delta">—</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={up ? "a-delta a-delta-up" : "a-delta a-delta-down"} title={`Kỳ trước: ${fmt(prev)}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
}

/** Biểu đồ cột lượt xem theo ngày (1 chuỗi – tiêu đề đã gọi tên, không cần chú giải). */
function DailyChart({ daily }: { daily: { date: string; views: number; users: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  const label = (s: string) => `${s.slice(6, 8)}/${s.slice(4, 6)}`;
  const step = daily.length > 10 ? 5 : 1; // nhãn trục X thưa khi 30 ngày
  return (
    <div className="a-chart" role="img" aria-label={`Lượt xem theo ngày, cao nhất ${fmt(max)}`}>
      <div className="a-chart-grid">
        <span>{fmt(max)}</span>
        <span>{fmt(Math.round(max / 2))}</span>
        <span>0</span>
      </div>
      <div className="a-chart-bars">
        {daily.map((d, i) => (
          <div key={d.date} className="a-chart-col" tabIndex={0} aria-label={`${label(d.date)}: ${fmt(d.views)} lượt xem, ${fmt(d.users)} người dùng`}>
            <div className="a-chart-bar" style={{ height: `${(d.views / max) * 100}%` }} />
            <div className="a-chart-tip">
              <b>{label(d.date)}</b>
              <span>{fmt(d.views)} lượt xem</span>
              <span>{fmt(d.users)} người dùng</span>
            </div>
            <span className="a-chart-x">{i % step === 0 || i === daily.length - 1 ? label(d.date) : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function GaStats({ days }: { days: 7 | 30 }) {
  const [report, realtime] = await Promise.all([getGaReport(days), getGaRealtime()]);

  const head = (
    <div className="a-page-head" style={{ marginBottom: 12 }}>
      <h2 style={{ margin: 0 }}>Thống kê truy cập (Google Analytics)</h2>
      <div className="a-toolbar" style={{ margin: 0 }}>
        {([7, 30] as const).map((d) => (
          <Link key={d} href={`/dashboard?range=${d}`} className={d === days ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"}>
            {d} ngày
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
          {report.status === "not-configured" ? `Chưa kết nối: ${report.reason}` : `Không lấy được số liệu: ${report.message}`}
        </p>
      </div>
    );
  }

  const { current: c, previous: p } = report;
  const cards = [
    { label: "Người dùng", cur: c.users, prev: p.users },
    { label: "Lượt xem trang", cur: c.views, prev: p.views },
    { label: "Phiên truy cập", cur: c.sessions, prev: p.sessions },
  ];

  return (
    <div className="a-card">
      {head}
      <div className="a-stats" style={{ marginBottom: 16 }}>
        <div className="a-stat a-stat-live">
          <b>{realtime === null ? "—" : fmt(realtime)}</b>
          <span>
            <i className="a-live-dot" /> Đang online (30 phút)
          </span>
        </div>
        {cards.map((k) => (
          <div key={k.label} className="a-stat">
            <b>{fmt(k.cur)}</b>
            <span>
              {k.label} <Delta cur={k.cur} prev={k.prev} />
            </span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 14 }}>Lượt xem theo ngày</h2>
      <DailyChart daily={report.daily} />

      <h2 style={{ fontSize: 14, marginTop: 20 }}>Trang được xem nhiều nhất</h2>
      {report.topPages.length === 0 ? (
        <p className="a-hint">Chưa có dữ liệu.</p>
      ) : (
        <table className="a-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Trang</th>
              <th className="a-right">Lượt xem</th>
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
        So sánh với {days} ngày trước đó · cập nhật mỗi giờ · lần lấy gần nhất {new Date(report.fetchedAt).toLocaleString("vi-VN")}
      </p>
    </div>
  );
}
