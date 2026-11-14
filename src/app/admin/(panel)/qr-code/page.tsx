import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function QrList() {
  const cats = await prisma.qrCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { sets: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>QR Code</h1>
          <p>{cats.length} loại coin / vật phẩm</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/admin/qr-code/new">
          + Thêm loại
        </Link>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th></th>
              <th>Tên</th>
              <th>Số bộ QR</th>
              <th>Màu</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td>{c.icon && <img className="a-row-img" src={c.icon} alt="" />}</td>
                <td>
                  <Link href={`/admin/qr-code/${c.id}`}>
                    <b>{c.name}</b>
                  </Link>
                  <div className="a-hint">/qr-code/{c.slug}</div>
                </td>
                <td>{c._count.sets}</td>
                <td>
                  <span className="a-swatch" style={{ background: c.color }} />
                </td>
                <td className="a-right">
                  <Link className="a-btn a-btn-sm" href={`/admin/qr-code/${c.id}`}>
                    Sửa
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
