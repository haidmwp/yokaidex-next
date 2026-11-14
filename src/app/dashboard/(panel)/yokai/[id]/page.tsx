import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import type { Evolution, Fusion, Moveset } from "@/lib/types";
import { yokaiHref } from "@/lib/constants";
import YokaiForm from "../YokaiForm";
import { deleteYokai, saveYokai } from "../actions";
import { formOptions } from "../shared";
import { getTr } from "@/lib/admin-lang-server";

export default async function EditYokai(props: PageProps<"/dashboard/yokai/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const { tr } = await getTr();
  const y = await prisma.yokai.findUnique({ where: { id: Number(id) } });
  if (!y) notFound();
  const { options, foods } = await formOptions(y.game);
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>
            #{y.number} {y.name} <small style={{ color: "var(--a-muted)", fontWeight: 500 }}>· Yo-kai Watch {y.game}</small>
          </h1>
          <p>
            <Link href={`/dashboard/yokai?game=${y.game}`}>{tr("← Danh sách", "← Back to list")}</Link> ·{" "}
            <a href={yokaiHref(y.game, y.slug)} target="_blank" rel="noreferrer">
              {tr("Xem trên site ↗", "View on site ↗")}
            </a>
          </p>
        </div>
      </div>
      {sp.created && <div className="a-alert a-alert-ok">✓ {tr("Đã tạo Yo-kai mới.", "New Yo-kai created.")}</div>}
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
        extraActions={<DeleteButton action={deleteYokai.bind(null, y.id)} label={tr("Xoá Yo-kai", "Delete Yo-kai")} />}
      />
    </>
  );
}
