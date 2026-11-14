// Dùng chung cho /password-1, /password-2, /password-3 và các trang vùng con.
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "./PageHeader";
import { getPasswordRegion, getPasswordRegions } from "@/lib/data";
import { PASSWORD_GAMES } from "@/lib/constants";

export const passwordGame = (game: number) => PASSWORD_GAMES.find((g) => g.game === game)!;

export async function PasswordRegionList({ game }: { game: number }) {
  const meta = passwordGame(game);
  const regions = await getPasswordRegions(game);
  const rows: (typeof regions)[] = [];
  for (let i = 0; i < regions.length; i += 2) rows.push(regions.slice(i, i + 2));
  return (
    <div id="password" className="content-wrapper">
      <PageHeader title={meta.title} color={meta.color} />
      <div className="password-content">
        <div className="container">
          <div className="password-1-wrapper">
            {rows.map((row, i) => (
              <div key={i} className="password-1-content-wrapper">
                {row.map((r) => (
                  <div key={r.id} className="password-1-content" style={{ backgroundColor: r.color }}>
                    <Link href={`/password-${game}/${r.code}`}>{r.label}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function PasswordTable({ game, params }: { game: number; params: Promise<{ region: string }> }) {
  const { region } = await params;
  const meta = passwordGame(game);
  const data = await getPasswordRegion(game, region);
  if (!data) notFound();
  return (
    <>
      <PageHeader title={`${meta.title} (${data.label})`} color={meta.color} />
      <div className="password-content">
        <div className="container">
          <div className="table-responsive">
            <table cellSpacing={0} className="table-password">
              <thead>
                <tr>
                  <th>Password</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                {data.passwords.map((p, i) => (
                  <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#B2B2B2" : "#FFF" }}>
                    <td>{p.code}</td>
                    <td>{p.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export async function passwordRegionParams(game: number) {
  const regions = await getPasswordRegions(game);
  return regions.map((r) => ({ region: r.code }));
}

export async function passwordRegionTitle(game: number, region: string) {
  const data = await getPasswordRegion(game, region);
  return data ? `${passwordGame(game).title} (${data.label})` : "Page not found!";
}
