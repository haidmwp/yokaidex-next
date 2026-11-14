import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Evolution, Fusion, Moveset } from "@/lib/types";
import YokaiForm from "../YokaiForm";
import { deleteYokai, saveYokai } from "../actions";
import { formOptions } from "../shared";

export default async function EditYokai(props: PageProps<"/admin/yokai/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const y = await prisma.yokai.findUnique({ where: { id: Number(id) } });
  if (!y) notFound();
  const { options, foods } = await formOptions();
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>
            #{y.number} {y.name}
          </h1>
          <p>
            <Link href="/admin/yokai">← Danh sách</Link> ·{" "}
            <a href={`/yokai-information/${y.slug}`} target="_blank" rel="noreferrer">
              Xem trên site ↗
            </a>
          </p>
        </div>
      </div>
      {sp.created && <div className="a-alert a-alert-ok">✓ Đã tạo Yo-kai mới.</div>}
      <YokaiForm
        action={saveYokai.bind(null, y.id)}
        options={options}
        foods={foods}
        initial={{
          ...y,
          profile: (y.profile as string[]) ?? [],
          evolution: (y.evolution as Evolution) ?? null,
          fusions: (y.fusions as Fusion[]) ?? [],
          moveset: y.moveset as Moveset,
        }}
        extraActions={<DeleteButton action={deleteYokai.bind(null, y.id)} label="Xoá Yo-kai" />}
      />
    </>
  );
}
