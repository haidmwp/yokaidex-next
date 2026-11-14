import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import RowsEditor from "@/components/admin/RowsEditor";
import { saveSouls } from "../collections";

export default async function SoulsAdmin() {
  const rows = await prisma.specialSoul.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>RARE Special Soul</h1>
          <p>Công thức: Soul 1 + Soul 2 = Kết quả</p>
        </div>
      </div>
      <AdminForm action={saveSouls}>
        <div className="a-card">
          <RowsEditor
            name="rows"
            addLabel="+ Thêm công thức"
            initial={rows.map((r) => ({
              soul1Name: r.soul1Name,
              soul1Slug: r.soul1Slug,
              soul1Image: r.soul1Image,
              soul2Name: r.soul2Name,
              soul2Slug: r.soul2Slug,
              soul2Image: r.soul2Image,
              resultName: r.resultName,
              resultImage: r.resultImage,
              description: r.description,
            }))}
            columns={[
              { key: "soul1Name", label: "Soul 1", width: 140 },
              { key: "soul1Slug", label: "Slug 1", width: 120 },
              { key: "soul1Image", label: "Ảnh 1", type: "image" },
              { key: "soul2Name", label: "Soul 2", width: 140 },
              { key: "soul2Slug", label: "Slug 2", width: 120 },
              { key: "soul2Image", label: "Ảnh 2", type: "image" },
              { key: "resultName", label: "Kết quả", width: 140 },
              { key: "resultImage", label: "Ảnh kết quả", type: "image" },
              { key: "description", label: "Mô tả", type: "textarea", width: 220 },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
