import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTr } from "@/lib/admin-lang-server";

export default async function QrList() {
  const { tr } = await getTr();
  const cats = await prisma.qrCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { sets: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>QR Code</h1>
          <p>{tr(`${cats.length} loại coin / vật phẩm`, `${cats.length} coin / item types`)}</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/dashboard/qr-code/new">
          {tr("+ Thêm loại", "+ Add type")}
        </Link>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>{tr("Thứ tự", "Order")}</th>
              <th>Icon</th>
              <th>{tr("Tên", "Name")}</th>
              <th>{tr("Số bộ QR", "QR sets")}</th>
              <th>{tr("Màu", "Color")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td>{c.icon && <img className="a-row-img" src={c.icon} alt="" />}</td>
                <td>
                  <Link href={`/dashboard/qr-code/${c.id}`}>
                    <b>{c.name}</b>
                  </Link>
                  <div className="a-hint">/qr-code/{c.slug}</div>
                </td>
                <td>{c._count.sets}</td>
                <td>
                  <span className="a-swatch" style={{ background: c.color }} />
                </td>
                <td className="a-right">
                  <Link className="a-btn a-btn-sm" href={`/dashboard/qr-code/${c.id}`}>
                    {tr("Sửa", "Edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
