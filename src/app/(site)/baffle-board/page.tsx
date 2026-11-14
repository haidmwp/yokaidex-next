import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import { getBaffleBoards } from "@/lib/data";
import { BAFFLE_GAMES, pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Baffle Board") };

export default async function BaffleBoardPage() {
  const rows = await getBaffleBoards();
  return (
    <div id="baffle-board" className="content-wrapper">
      <PageHeader title="Baffle Board" color="#6DAA73" />
      <div className="baffle-board-content">
        <div className="container">
          {BAFFLE_GAMES.map((g, gi) => (
            <div key={g.id} className="baffle-board">
              <h2 className="baffle-board-content-title">{g.title}</h2>
              <div className="table-responsive">
                <table cellSpacing={0} className={`table-baffle-board table-baffle-board-${gi + 1}`}>
                  <thead>
                    <tr>
                      {g.hasLocation && <th>Location</th>}
                      <th>Clues</th>
                      <th>Solution</th>
                      {g.hasLocation && <th>Effect</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .filter((r) => r.game === g.id)
                      .map((r) => (
                        <tr key={r.id}>
                          {g.hasLocation && <td>{r.location}</td>}
                          <td>
                            {r.clues.map((c, i) => (
                              <p key={i}>
                                {i + 1}. {c}
                              </p>
                            ))}
                          </td>
                          <td className="baffle-board-solution">
                            {r.slug ? <Link href={`/yokai-information/${r.slug}`}>{r.solution}</Link> : r.solution}
                          </td>
                          {g.hasLocation && <td>{r.effect}</td>}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
