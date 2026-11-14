import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PASSWORD_GAMES } from "@/lib/constants";

export default async function PasswordAdmin() {
  const regions = await prisma.passwordRegion.findMany({
    orderBy: [{ game: "asc" }, { sortOrder: "asc" }],
    include: { _count: { select: { passwords: true } } },
  });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Password</h1>
          <p>Password theo game và vùng/ngôn ngữ</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/dashboard/passwords/new">
          + Thêm vùng
        </Link>
      </div>
      {PASSWORD_GAMES.map((g) => (
        <div key={g.game} className="a-card">
          <h2>{g.title.replace("PW ", "")}</h2>
          <table className="a-table">
            <thead>
              <tr>
                <th>Vùng</th>
                <th>URL</th>
                <th>Số password</th>
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
                        Sửa
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
