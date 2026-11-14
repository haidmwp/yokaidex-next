import AdminForm from "@/components/admin/AdminForm";
import { ColorField, ImageField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import type { ActionState } from "@/lib/admin";

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  cat: { name: string; slug: string; color: string; image: string; sortOrder: number };
  items: { name: string; image: string; onFriend: string; onFoe: string }[];
  extraActions?: React.ReactNode;
};

export default function FoodForm({ action, cat, items, extraActions }: Props) {
  return (
    <AdminForm action={action} extraActions={extraActions}>
      <div className="a-card">
        <h2>Nhóm món ăn</h2>
        <div className="a-form-grid">
          <TextField name="name" label="Tên nhóm" defaultValue={cat.name} required />
          <TextField name="slug" label="Slug" defaultValue={cat.slug} hint="Đường dẫn /food/slug" />
          <ColorField name="color" defaultValue={cat.color} />
          <TextField name="sortOrder" label="Thứ tự" type="number" defaultValue={cat.sortOrder} />
        </div>
        <div className="a-form-grid" style={{ marginTop: 14, gridTemplateColumns: "1fr" }}>
          <ImageField name="image" label="Ảnh đại diện" defaultValue={cat.image} />
        </div>
      </div>
      <div className="a-card">
        <h2>Danh sách món</h2>
        <RowsEditor
          name="items"
          addLabel="+ Thêm món"
          initial={items}
          columns={[
            { key: "name", label: "Tên món", width: 180 },
            { key: "image", label: "Ảnh", type: "image" },
            { key: "onFriend", label: "On Friend" },
            { key: "onFoe", label: "On Foe" },
          ]}
        />
      </div>
    </AdminForm>
  );
}
