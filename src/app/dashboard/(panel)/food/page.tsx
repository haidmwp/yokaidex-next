import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTr } from "@/lib/admin-lang-server";

export default async function FoodList() {
  const { tr } = await getTr();
  const cats = await prisma.foodCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Food</h1>
          <p>{tr(`${cats.length} nhóm món ăn`, `${cats.length} food groups`)}</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/dashboard/food/new">
          {tr("+ Thêm nhóm", "+ Add group")}
        </Link>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>{tr("Thứ tự", "Order")}</th>
              <th>Icon</th>
              <th>{tr("Nhóm", "Group")}</th>
              <th>{tr("Số món", "Items")}</th>
              <th>{tr("Màu", "Color")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td>{c.image && <img className="a-row-img" src={c.image} alt="" />}</td>
                <td>
                  <Link href={`/dashboard/food/${c.id}`}>
                    <b>{c.name}</b>
                  </Link>
                  <div className="a-hint">/food/{c.slug}</div>
                </td>
                <td>{c._count.items}</td>
                <td>
                  <span className="a-swatch" style={{ background: c.color }} />
                </td>
                <td className="a-right">
                  <Link className="a-btn a-btn-sm" href={`/dashboard/food/${c.id}`}>
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
