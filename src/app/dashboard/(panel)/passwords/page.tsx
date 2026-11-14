import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PASSWORD_GAMES } from "@/lib/constants";
import { getTr } from "@/lib/admin-lang-server";

export default async function PasswordAdmin() {
  const { tr } = await getTr();
  const regions = await prisma.passwordRegion.findMany({
    orderBy: [{ game: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { passwords: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Password</h1>
          <p>{tr("Password theo game và vùng/ngôn ngữ", "Passwords by game and region/language")}</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/dashboard/passwords/new">
          {tr("+ Thêm vùng", "+ Add region")}
        </Link>
      </div>
      {PASSWORD_GAMES.map((g) => (
        <div key={g.game} className="a-card">
          <h2>{g.title.replace("PW ", "")}</h2>
          <table className="a-table">
            <thead>
              <tr>
                <th>{tr("Vùng", "Region")}</th>
                <th>URL</th>
                <th>{tr("Số password", "Passwords")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {regions
                .filter((r) => r.game === g.game)
                .map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="a-swatch" style={{ background: r.color }} /> <b>{r.label}</b>
                    </td>
                    <td className="a-hint">
                      /password-{r.game}/{r.code}
                    </td>
                    <td>{r._count.passwords}</td>
                    <td className="a-right">
                      <Link className="a-btn a-btn-sm" href={`/dashboard/passwords/${r.id}`}>
                        {tr("Sửa", "Edit")}
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
