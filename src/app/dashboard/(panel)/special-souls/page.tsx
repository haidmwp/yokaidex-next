import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import RowsEditor from "@/components/admin/RowsEditor";
import { saveSouls } from "../collections";
import { getTr } from "@/lib/admin-lang-server";

export default async function SoulsAdmin() {
  const { tr } = await getTr();
  const rows = await prisma.specialSoul.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>RARE Special Soul</h1>
          <p>{tr("Công thức: Soul 1 + Soul 2 = Kết quả", "Recipe: Soul 1 + Soul 2 = Result")}</p>
        </div>
      </div>
      <AdminForm action={saveSouls}>
        <div className="a-card">
          <RowsEditor
            name="rows"
            addLabel={tr("+ Thêm công thức", "+ Add recipe")}
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
              { key: "soul1Image", label: tr("Ảnh 1", "Image 1"), type: "image" },
              { key: "soul2Name", label: "Soul 2", width: 140 },
              { key: "soul2Slug", label: "Slug 2", width: 120 },
              { key: "soul2Image", label: tr("Ảnh 2", "Image 2"), type: "image" },
              { key: "resultName", label: tr("Kết quả", "Result"), width: 140 },
              { key: "resultImage", label: tr("Ảnh kết quả", "Result image"), type: "image" },
              { key: "description", label: tr("Mô tả", "Description"), type: "textarea", width: 220 },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
