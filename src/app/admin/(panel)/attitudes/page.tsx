import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import RowsEditor from "@/components/admin/RowsEditor";
import { saveAttitudes } from "../collections";

export default async function AttitudesAdmin() {
  const rows = await prisma.attitude.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Attitudes</h1>
        </div>
      </div>
      <AdminForm action={saveAttitudes}>
        <div className="a-card">
          <RowsEditor
            name="rows"
            initial={rows.map((r) => ({ name: r.name, stats: r.stats, preference: r.preference, book: r.book }))}
            columns={[
              { key: "name", label: "Attitude" },
              { key: "stats", label: "Stat(s) Gained" },
              { key: "preference", label: "Battle Action Preference" },
              { key: "book", label: "Associated Book" },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
