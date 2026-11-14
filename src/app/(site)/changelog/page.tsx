import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { getChangelog } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Changelog") };

export default async function ChangelogPage() {
  const rows = await getChangelog();
  return (
    <div id="attitudes" className="content-wrapper">
      <PageHeader title="Changelog" color="#AA90B4" />
      <div className="changelog-content">
        <div className="container">
          <div className="table-responsive">
            <table cellSpacing={0} className="table-changelog">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="changelog-content-title">{r.version}</td>
                    <td>
                      {r.items.map((it, i) => (
                        <p key={i}>- {it}</p>
                      ))}
                    </td>
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
