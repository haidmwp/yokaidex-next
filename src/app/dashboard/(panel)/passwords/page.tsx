import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PASSWORD_GAMES } from "@/lib/constants";
import { getTr } from "@/lib/admin-lang-server";

// Giống trang Yo-kai: tab Yo-kai Watch 1/2/3 (?game=) + một bảng cho game đang chọn
export default async function PasswordAdmin(props: PageProps<"/dashboard/passwords">) {
  const sp = (await props.searchParams) as { game?: string };
  const game = [1, 2, 3].includes(Number(sp.game)) ? Number(sp.game) : 1;
  const { tr } = await getTr();
  const regions = await prisma.passwordRegion.findMany({
    where: { game },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { _count: { select: { passwords: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Password</h1>
          <p>
            {tr(`${regions.length} vùng/ngôn ngữ trong Yo-kai Watch ${game}`, `${regions.length} regions/languages in Yo-kai Watch ${game}`)}
          </p>
        </div>
        <Link className="a-btn a-btn-primary" href={`/dashboard/passwords/new?game=${game}`}>
          {tr("+ Thêm vùng", "+ Add region")}
        </Link>
      </div>
      <div className="a-toolbar">
        {PASSWORD_GAMES.map((g) => (
          <Link key={g.game} href={`/dashboard/passwords?game=${g.game}`} className={g.game === game ? "a-btn a-btn-primary" : "a-btn"}>
            Yo-kai Watch {g.game}
          </Link>
        ))}
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>{tr("Thứ tự", "Order")}</th>
              <th>{tr("Vùng", "Region")}</th>
              <th>{tr("Số password", "Passwords")}</th>
              <th>{tr("Màu", "Color")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r) => (
              <tr key={r.id}>
                <td>{r.sortOrder}</td>
                <td>
                  <Link href={`/dashboard/passwords/${r.id}`}>
                    <b>{r.label}</b>
                  </Link>
                  <div className="a-hint">
                    /password-{r.game}/{r.code}
                  </div>
                </td>
                <td>{r._count.passwords}</td>
                <td>
                  <span className="a-swatch" style={{ background: r.color }} />
                </td>
                <td className="a-right">
                  <a className="a-btn a-btn-sm" href={`/password-${r.game}/${r.code}`} target="_blank" rel="noreferrer">
                    {tr("Xem", "View")}
                  </a>{" "}
                  <Link className="a-btn a-btn-sm" href={`/dashboard/passwords/${r.id}`}>
                    {tr("Sửa", "Edit")}
                  </Link>
                </td>
              </tr>
            ))}
            {regions.length === 0 && (
              <tr>
                <td colSpan={5} className="a-hint">
                  {tr("Chưa có vùng nào.", "No regions yet.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
