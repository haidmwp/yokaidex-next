import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTr } from "@/lib/admin-lang-server";

const PUBLIC_URL: Record<string, string> = { home: "/", "privacy-policy": "/privacy-policy" };

export default async function PagesAdmin() {
  const { tr, locale } = await getTr();
  const pages = await prisma.page.findMany({ orderBy: { id: "asc" } });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{tr("Trang tĩnh", "Static pages")}</h1>
          <p>{tr("Nội dung HTML của trang chủ và chính sách bảo mật", "HTML content of the home page and privacy policy")}</p>
        </div>
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>{tr("Trang", "Page")}</th>
              <th>URL</th>
              <th>{tr("Cập nhật", "Updated")}</th>
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
                <td>{p.updatedAt.toLocaleString(locale)}</td>
                <td className="a-right">
                  <Link className="a-btn a-btn-sm" href={`/dashboard/pages/${p.slug}`}>
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
