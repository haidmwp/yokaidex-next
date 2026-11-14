import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
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
    { href: "/admin/yokai", n: yokai, label: "Yo-kai" },
    { href: "/admin/food", n: foodItems, label: `Món ăn (${food} nhóm)` },
    { href: "/admin/qr-code", n: qrSets, label: `Bộ QR (${qr} loại coin)` },
    { href: "/admin/baffle-board", n: baffle, label: "Baffle board" },
    { href: "/admin/passwords", n: pw, label: "Password" },
    { href: "/admin/special-souls", n: souls, label: "Special soul" },
    { href: "/admin/messages", n: messages, label: `Tin nhắn (${unread} chưa đọc)` },
  ];
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Quản trị nội dung YokaiDex</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/admin/yokai/new">
          + Thêm Yo-kai
        </Link>
      </div>
      <div className="a-stats">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="a-stat">
            <b>{s.n.toLocaleString()}</b>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
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
