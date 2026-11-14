import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function FoodList() {
  const cats = await prisma.foodCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Food</h1>
          <p>{cats.length} nhóm món ăn</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/admin/food/new">
          + Thêm nhóm
        </Link>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th></th>
              <th>Nhóm</th>
              <th>Số món</th>
              <th>Màu</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td>{c.image && <img className="a-row-img" src={c.image} alt="" />}</td>
                <td>
                  <Link href={`/admin/food/${c.id}`}>
                    <b>{c.name}</b>
                  </Link>
                  <div className="a-hint">/food/{c.slug}</div>
                </td>
                <td>{c._count.items}</td>
                <td>
                  <span className="a-swatch" style={{ background: c.color }} />
                </td>
                <td className="a-right">
                  <Link className="a-btn a-btn-sm" href={`/admin/food/${c.id}`}>
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
