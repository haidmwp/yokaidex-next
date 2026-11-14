import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { getAttitudes } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Attitudes") };

export default async function AttitudesPage() {
  const rows = await getAttitudes();
  return (
    <div id="attitudes" className="content-wrapper">
      <PageHeader title="Attitudes" color="#AA90B4" />
      <div className="attitudes-content">
        <div className="container">
          <div className="table-responsive">
            <table cellSpacing={0} className="table-attitudes">
              <thead>
                <tr>
                  <th>Attitude</th>
                  <th>Stat(s) Gained</th>
                  <th>Battle Action Preference</th>
                  <th>Associated Book</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.stats}</td>
                    <td>{r.preference}</td>
                    <td>{r.book}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
