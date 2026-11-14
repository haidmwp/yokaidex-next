// Đọc số liệu Google Analytics 4 qua GA Data API (service account, quyền Viewer).
// Cấu hình trong .env: GA_PROPERTY_ID, GA_CREDENTIALS_FILE (file JSON khoá service account, nằm trong /secrets).
import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export const GA_TAG = "ga-stats";

/** Các khoảng thời gian chọn được trên Tổng quan (?range=...). */
export const GA_RANGES = [
  { days: 7, label: "7 ngày", labelEn: "7 days" },
  { days: 30, label: "30 ngày", labelEn: "30 days" },
  { days: 90, label: "3 tháng", labelEn: "3 months" },
] as const;
export type GaDays = (typeof GA_RANGES)[number]["days"];
export const gaRange = (v?: string) => GA_RANGES.find((r) => String(r.days) === v) ?? GA_RANGES[0];

const pad2 = (n: number) => String(n).padStart(2, "0");

type Totals = { users: number; views: number; sessions: number };
export type GaReport =
  | { status: "not-configured"; reason: string }
  | { status: "error"; message: string }
  | {
      status: "ok";
      days: number;
      current: Totals;
      previous: Totals;
      /** Lượt xem từng ngày trong khoảng (key = YYYYMMDD) */
      daily: { key: string; label: string; date: string; views: number; users: number }[];
      topPages: { path: string; title: string; views: number }[];
      fetchedAt: string;
    };

function config() {
  const propertyId = process.env.GA_PROPERTY_ID?.trim();
  const file = process.env.GA_CREDENTIALS_FILE?.trim();
  if (!propertyId || !file) return { error: "Chưa khai báo GA_PROPERTY_ID / GA_CREDENTIALS_FILE trong .env." };
  const keyFilename = path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
  if (!fs.existsSync(keyFilename)) return { error: `Không tìm thấy file khoá ${file}.` };
  return { propertyId, keyFilename };
}

let client: BetaAnalyticsDataClient | null = null;
function getClient(keyFilename: string) {
  if (client) return client;
  const key = JSON.parse(fs.readFileSync(keyFilename, "utf8")) as { client_email: string; private_key: string; project_id: string };
  client = new BetaAnalyticsDataClient({
    credentials: { client_email: key.client_email, private_key: key.private_key },
    projectId: key.project_id,
  });
  return client;
}

const num = (v?: string | null) => Number(v ?? 0) || 0;

/** Báo cáo N ngày gần nhất (so với N ngày trước đó). Cache 1 giờ để tiết kiệm hạn mức API. */
export async function getGaReport(days: GaDays): Promise<GaReport> {
  "use cache";
  cacheLife("hours");
  cacheTag(GA_TAG);

  const cfg = config();
  if ("error" in cfg) return { status: "not-configured", reason: cfg.error! };
  const property = `properties/${cfg.propertyId}`;
  const metrics = [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "sessions" }];
  try {
    const [res] = await getClient(cfg.keyFilename).batchRunReports({
      property,
      requests: [
        {
          dateRanges: [
            { startDate: `${days - 1}daysAgo`, endDate: "today", name: "current" },
            { startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo`, name: "previous" },
          ],
          metrics,
        },
        {
          dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 1000,
        },
        {
          dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: "today" }],
          dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        },
      ],
    });
    const [totalsR, dailyR, topR] = res.reports ?? [];

    const totals = (range: string): Totals => {
      const row = totalsR?.rows?.find((r) => r.dimensionValues?.some((d) => d.value === range)) ?? totalsR?.rows?.[range === "current" ? 0 : 1];
      return { users: num(row?.metricValues?.[0]?.value), views: num(row?.metricValues?.[1]?.value), sessions: num(row?.metricValues?.[2]?.value) };
    };

    // điền đủ các ngày trong khoảng (kể cả ngày không có lượt xem)
    const byKey = new Map((dailyR?.rows ?? []).map((r) => [r.dimensionValues?.[0]?.value ?? "", r]));
    const daily: { key: string; label: string; date: string; views: number; users: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
      const r = byKey.get(key);
      daily.push({
        key,
        label: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`,
        date: `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`,
        views: num(r?.metricValues?.[0]?.value),
        users: num(r?.metricValues?.[1]?.value),
      });
    }

    return {
      status: "ok",
      days,
      current: totals("current"),
      previous: totals("previous"),
      daily,
      topPages: (topR?.rows ?? []).map((r) => ({
        path: r.dimensionValues?.[0]?.value ?? "",
        title: r.dimensionValues?.[1]?.value ?? "",
        views: num(r.metricValues?.[0]?.value),
      })),
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { status: "error", message: (e as Error).message?.split("\n")[0] ?? "Lỗi không xác định" };
  }
}

/** Số người đang hoạt động (30 phút gần nhất) – realtime, cache 1 phút. */
export async function getGaRealtime(): Promise<number | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(GA_TAG);
  const cfg = config();
  if ("error" in cfg) return null;
  try {
    const [res] = await getClient(cfg.keyFilename).runRealtimeReport({
      property: `properties/${cfg.propertyId}`,
      metrics: [{ name: "activeUsers" }],
    });
    return num(res.rows?.[0]?.metricValues?.[0]?.value);
  } catch {
    return null;
  }
}
