import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import FoodForm from "../FoodForm";
import { deleteFood, saveFood } from "../actions";

export default async function EditFood(props: PageProps<"/admin/food/[id]">) {
  const { id } = await props.params;
  if (id === "new") {
    return (
      <>
        <div className="a-page-head">
          <div>
            <h1>Thêm nhóm món ăn</h1>
            <p>
              <Link href="/admin/food">← Danh sách</Link>
            </p>
          </div>
        </div>
        <FoodForm action={saveFood.bind(null, null)} cat={{ name: "", slug: "", color: "#FBA6CC", image: "", sortOrder: 99 }} items={[]} />
      </>
    );
  }
  const cat = await prisma.foodCategory.findUnique({
    where: { id: Number(id) },
    include: { items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  if (!cat) notFound();
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{cat.name}</h1>
          <p>
            <Link href="/admin/food">← Danh sách</Link> ·{" "}
            <a href={`/food/${cat.slug}`} target="_blank" rel="noreferrer">
              Xem trên site ↗
            </a>
          </p>
        </div>
      </div>
      <FoodForm
        action={saveFood.bind(null, cat.id)}
        cat={cat}
        items={cat.items.map(({ name, image, onFriend, onFoe }) => ({ name, image, onFriend, onFoe }))}
        extraActions={<DeleteButton action={deleteFood.bind(null, cat.id)} label="Xoá nhóm" />}
      />
    </>
  );
}
