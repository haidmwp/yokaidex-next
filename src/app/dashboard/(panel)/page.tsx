import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import GaStats from "@/components/admin/GaStats";
import { gaRange } from "@/lib/ga";
import { getTr } from "@/lib/admin-lang-server";

export default async function Dashboard(props: PageProps<"/dashboard">) {
  const sp = (await props.searchParams) as { range?: string };
  const days = gaRange(sp.range).days;
  const { tr, locale } = await getTr();
  const [yokai, food, foodItems, qr, qrSets, baffle, pw, souls, messages, unread, recent] = await Promise.all([
    prisma.yokai.count(),
    prisma.foodCategory.count(),
    prisma.foodItem.count(),
    prisma.qrCategory.count(),
    prisma.qrSet.count(),
    prisma.baffleBoard.count(),
    prisma.password.count(),
    prisma.specialSoul.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const stats = [
    { href: "/dashboard/yokai", n: yokai, label: "Yo-kai" },
    { href: "/dashboard/food", n: foodItems, label: tr(`Món ăn (${food} nhóm)`, `Food items (${food} groups)`) },
    { href: "/dashboard/qr-code", n: qrSets, label: tr(`Bộ QR (${qr} loại coin)`, `QR sets (${qr} coin types)`) },
    { href: "/dashboard/baffle-board", n: baffle, label: "Baffle board" },
    { href: "/dashboard/passwords", n: pw, label: "Password" },
    { href: "/dashboard/special-souls", n: souls, label: "Special soul" },
    { href: "/dashboard/messages", n: messages, label: tr(`Tin nhắn (${unread} chưa đọc)`, `Messages (${unread} unread)`) },
  ];
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{tr("Trang quản trị", "Dashboard")}</h1>
          <p>{tr("Quản trị nội dung YokaiDex", "YokaiDex content management")}</p>
        </div>
      </div>
      <div className="a-stats">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="a-stat">
            <b>{s.n.toLocaleString(locale)}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
      <Suspense fallback={<div className="a-card a-hint">{tr("Đang tải thống kê Google Analytics...", "Loading Google Analytics stats...")}</div>}>
        <GaStats days={days} />
      </Suspense>
      <div className="a-card">
        <h2>{tr("Tin nhắn mới nhất", "Latest messages")}</h2>
        {recent.length === 0 ? (
          <p className="a-hint">{tr("Chưa có tin nhắn nào.", "No messages yet.")}</p>
        ) : (
          <table className="a-table">
            <tbody>
              {recent.map((m) => (
                <tr key={m.id} className={m.read ? undefined : "a-unread"}>
                  <td>{m.name}</td>
                  <td>{m.subject}</td>
                  <td className="a-right">{m.createdAt.toLocaleString(locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
