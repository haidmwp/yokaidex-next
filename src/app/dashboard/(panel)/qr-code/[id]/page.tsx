import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { ColorField, ImageField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import { deleteQr, saveQr } from "../actions";

export default async function EditQr(props: PageProps<"/dashboard/qr-code/[id]">) {
  const { id } = await props.params;
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
          <h1>{isNew ? "Thêm loại QR" : cat.name}</h1>
          <p>
            <Link href="/dashboard/qr-code">← Danh sách</Link>
            {!isNew && (
              <>
                {" · "}
                <a href={`/qr-code/${cat.slug}`} target="_blank" rel="noreferrer">
                  Xem trên site ↗
                </a>
              </>
            )}
          </p>
        </div>
      </div>
      <AdminForm
        action={saveQr.bind(null, isNew ? null : cat.id)}
        extraActions={!isNew && <DeleteButton action={deleteQr.bind(null, cat.id)} label="Xoá loại này" />}
      >
        <div className="a-card">
          <h2>Thông tin</h2>
          <div className="a-form-grid">
            <TextField name="name" label="Tên" defaultValue={cat.name} required />
            <TextField name="slug" label="Slug" defaultValue={cat.slug} />
            <ColorField name="color" defaultValue={cat.color} />
            <TextField name="sortOrder" label="Thứ tự" type="number" defaultValue={cat.sortOrder} />
          </div>
          <div className="a-form-grid" style={{ marginTop: 14, gridTemplateColumns: "1fr" }}>
            <ImageField name="icon" label="Icon" defaultValue={cat.icon} />
          </div>
        </div>
        <div className="a-card">
          <h2>Các bộ QR</h2>
          <p className="a-hint">Mỗi bộ là một trang slide; cột “Ảnh QR” nhập mỗi dòng một URL ảnh.</p>
          <RowsEditor
            name="sets"
            addLabel="+ Thêm bộ QR"
            defaults={{ color: cat.color }}
            initial={cat.sets.map((s) => ({ name: s.name, slug: s.slug, color: s.color, slides: (s.slides as string[]) ?? [] }))}
            columns={[
              { key: "name", label: "Tên", width: 160 },
              { key: "slug", label: "Slug", width: 160, placeholder: "tự tạo từ tên" },
              { key: "color", label: "Màu", type: "color", width: 150 },
              { key: "slides", label: "Ảnh QR (mỗi dòng 1 URL)", type: "lines" },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
