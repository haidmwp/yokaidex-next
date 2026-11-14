import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PUBLIC_URL: Record<string, string> = { home: "/", "privacy-policy": "/privacy-policy" };

export default async function PagesAdmin() {
  const pages = await prisma.page.findMany({ orderBy: { id: "asc" } });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Trang tĩnh</h1>
          <p>Nội dung HTML của trang chủ và chính sách bảo mật</p>
        </div>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Trang</th>
              <th>URL</th>
              <th>Cập nhật</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="a-swatch" style={{ background: p.color }} /> <b>{p.title}</b>
                </td>
                <td className="a-hint">{PUBLIC_URL[p.slug] ?? `/${p.slug}`}</td>
                <td>{p.updatedAt.toLocaleString("vi-VN")}</td>
                <td className="a-right">
                  <Link className="a-btn a-btn-sm" href={`/admin/pages/${p.slug}`}>
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
