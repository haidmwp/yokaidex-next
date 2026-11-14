import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import RowsEditor from "@/components/admin/RowsEditor";
import { saveChangelog } from "../collections";

export default async function ChangelogAdmin() {
  const rows = await prisma.changelog.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "desc" }] });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Changelog</h1>
          <p>Dòng trên cùng hiển thị đầu tiên.</p>
        </div>
      </div>
      <AdminForm action={saveChangelog}>
        <div className="a-card">
          <RowsEditor
            name="rows"
            addLabel="+ Thêm phiên bản"
            initial={rows.map((r) => ({ version: r.version, items: (r.items as string[]) ?? [] }))}
            columns={[
              { key: "version", label: "Phiên bản", width: 200 },
              { key: "items", label: "Nội dung (mỗi dòng 1 mục)", type: "lines" },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
