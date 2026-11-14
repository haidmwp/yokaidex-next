import AdminForm from "@/components/admin/AdminForm";
import { ColorField, ImageField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import type { ActionState } from "@/lib/admin";
import { getTr } from "@/lib/admin-lang-server";

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  cat: { name: string; slug: string; color: string; image: string; sortOrder: number };
  items: { name: string; image: string; onFriend: string; onFoe: string }[];
  extraActions?: React.ReactNode;
};

export default async function FoodForm({ action, cat, items, extraActions }: Props) {
  const { tr } = await getTr();
  return (
    <AdminForm action={action} extraActions={extraActions}>
      <div className="a-card">
        <h2>{tr("Nhóm món ăn", "Food group")}</h2>
        <div className="a-form-grid">
          <TextField name="name" label={tr("Tên nhóm", "Group name")} defaultValue={cat.name} required />
          <TextField name="slug" label="Slug" defaultValue={cat.slug} hint={tr("Đường dẫn /food/slug", "URL /food/slug")} />
          <ColorField name="color" defaultValue={cat.color} />
          <TextField name="sortOrder" label={tr("Thứ tự", "Order")} type="number" defaultValue={cat.sortOrder} />
        </div>
        <div className="a-form-grid" style={{ marginTop: 14, gridTemplateColumns: "1fr" }}>
          <ImageField name="image" label={tr("Ảnh đại diện", "Cover image")} defaultValue={cat.image} />
        </div>
      </div>
      <div className="a-card">
        <h2>{tr("Danh sách món", "Food items")}</h2>
        <RowsEditor
          name="items"
          addLabel={tr("+ Thêm món", "+ Add item")}
          initial={items}
          columns={[
            { key: "name", label: tr("Tên món", "Item name"), width: 180 },
            { key: "image", label: tr("Ảnh", "Image"), type: "image" },
            { key: "onFriend", label: "On Friend" },
            { key: "onFoe", label: "On Foe" },
          ]}
        />
      </div>
    </AdminForm>
  );
}
