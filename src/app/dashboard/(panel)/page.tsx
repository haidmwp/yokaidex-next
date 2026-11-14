import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import GaStats from "@/components/admin/GaStats";

export default async function Dashboard(props: PageProps<"/dashboard">) {
  const sp = (await props.searchParams) as { range?: string };
  const days = sp.range === "30" ? 30 : 7;
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
    { href: "/dashboard/food", n: foodItems, label: `Món ăn (${food} nhóm)` },
    { href: "/dashboard/qr-code", n: qrSets, label: `Bộ QR (${qr} loại coin)` },
    { href: "/dashboard/baffle-board", n: baffle, label: "Baffle board" },
    { href: "/dashboard/passwords", n: pw, label: "Password" },
    { href: "/dashboard/special-souls", n: souls, label: "Special soul" },
    { href: "/dashboard/messages", n: messages, label: `Tin nhắn (${unread} chưa đọc)` },
  ];
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Quản trị nội dung YokaiDex</p>
        </div>
      </div>
      <div className="a-stats">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="a-stat">
            <b>{s.n.toLocaleString()}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
      <Suspense fallback={<div className="a-card a-hint">Đang tải thống kê Google Analytics...</div>}>
        <GaStats days={days} />
      </Suspense>
      <div className="a-card">
        <h2>Tin nhắn mới nhất</h2>
        {recent.length === 0 ? (
          <p className="a-hint">Chưa có tin nhắn nào.</p>
        ) : (
          <table className="a-table">
            <tbody>
              {recent.map((m) => (
                <tr key={m.id} className={m.read ? undefined : "a-unread"}>
                  <td>{m.name}</td>
                  <td>{m.subject}</td>
                  <td className="a-right">{m.createdAt.toLocaleString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
