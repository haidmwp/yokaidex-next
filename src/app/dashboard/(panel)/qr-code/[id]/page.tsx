import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { ColorField, ImageField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import { deleteQr, saveQr } from "../actions";
import { getTr } from "@/lib/admin-lang-server";

export default async function EditQr(props: PageProps<"/dashboard/qr-code/[id]">) {
  const { id } = await props.params;
  const { tr } = await getTr();
  const isNew = id === "new";
  const cat = isNew
    ? { id: 0, name: "", slug: "", color: "#FFC648", icon: "", sortOrder: 999, sets: [] }
    : await prisma.qrCategory.findUnique({
        where: { id: Number(id) },
        include: { sets: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
      });
  if (!cat) notFound();
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{isNew ? tr("Thêm loại QR", "Add QR type") : cat.name}</h1>
          <p>
            <Link href="/dashboard/qr-code">{tr("← Danh sách", "← Back to list")}</Link>
            {!isNew && (
              <>
                {" · "}
                <a href={`/qr-code/${cat.slug}`} target="_blank" rel="noreferrer">
                  {tr("Xem trên site ↗", "View on site ↗")}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
      <AdminForm
        action={saveQr.bind(null, isNew ? null : cat.id)}
        extraActions={!isNew && <DeleteButton action={deleteQr.bind(null, cat.id)} label={tr("Xoá loại này", "Delete this type")} />}
      >
        <div className="a-card">
          <h2>{tr("Thông tin", "Details")}</h2>
          <div className="a-form-grid">
            <TextField name="name" label={tr("Tên", "Name")} defaultValue={cat.name} required />
            <TextField name="slug" label="Slug" defaultValue={cat.slug} />
            <ColorField name="color" defaultValue={cat.color} />
            <TextField name="sortOrder" label={tr("Thứ tự", "Order")} type="number" defaultValue={cat.sortOrder} />
          </div>
          <div className="a-form-grid" style={{ marginTop: 14, gridTemplateColumns: "1fr" }}>
            <ImageField name="icon" label="Icon" defaultValue={cat.icon} />
          </div>
        </div>
        <div className="a-card">
          <h2>{tr("Các bộ QR", "QR sets")}</h2>
          <p className="a-hint">{tr("Mỗi bộ là một trang slide; cột “Ảnh QR” nhập mỗi dòng một URL ảnh.", "Each set is one slide page; in the “QR images” column enter one image URL per line.")}</p>
          <RowsEditor
            name="sets"
            addLabel={tr("+ Thêm bộ QR", "+ Add QR set")}
            defaults={{ color: cat.color }}
            initial={cat.sets.map((s) => ({ name: s.name, slug: s.slug, color: s.color, slides: (s.slides as string[]) ?? [] }))}
            columns={[
              { key: "name", label: tr("Tên", "Name"), width: 160 },
              { key: "slug", label: "Slug", width: 160, placeholder: tr("tự tạo từ tên", "auto from name") },
              { key: "color", label: tr("Màu", "Color"), type: "color", width: 150 },
              { key: "slides", label: tr("Ảnh QR (mỗi dòng 1 URL)", "QR images (one URL per line)"), type: "lines" },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
