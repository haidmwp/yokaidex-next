import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import RowsEditor from "@/components/admin/RowsEditor";
import { saveChangelog } from "../collections";
import { getTr } from "@/lib/admin-lang-server";

export default async function ChangelogAdmin() {
  const { tr } = await getTr();
  const rows = await prisma.changelog.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "desc" }] });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Changelog</h1>
          <p>{tr("Dòng trên cùng hiển thị đầu tiên.", "The top row is shown first.")}</p>
        </div>
      </div>
      <AdminForm action={saveChangelog}>
        <div className="a-card">
          <RowsEditor
            name="rows"
            addLabel={tr("+ Thêm phiên bản", "+ Add version")}
            initial={rows.map((r) => ({ version: r.version, items: (r.items as string[]) ?? [] }))}
            columns={[
              { key: "version", label: tr("Phiên bản", "Version"), width: 200 },
              { key: "items", label: tr("Nội dung (mỗi dòng 1 mục)", "Changes (one item per line)"), type: "lines" },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
