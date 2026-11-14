import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { emptyMoveset } from "@/lib/types";
import YokaiForm from "../YokaiForm";
import { saveYokai } from "../actions";
import { formOptions } from "../shared";

export default async function NewYokai(props: PageProps<"/dashboard/yokai/new">) {
  const sp = (await props.searchParams) as { game?: string };
  const game = [1, 2, 3].includes(Number(sp.game)) ? Number(sp.game) : 3;
  const { options, foods } = await formOptions(game);
  const last = await prisma.yokai.findFirst({ where: { game }, orderBy: { number: "desc" }, select: { number: true } });
  const next = String((parseInt(last?.number ?? "0", 10) || 0) + 1).padStart(3, "0");
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Thêm Yo-kai · Yo-kai Watch {game}</h1>
          <p>
            <Link href={`/dashboard/yokai?game=${game}`}>← Danh sách</Link>
          </p>
        </div>
      </div>
      <YokaiForm
        action={saveYokai.bind(null, null)}
        options={options}
        foods={foods}
        initial={{
          game,
          number: next,
          name: "",
          slug: "",
          rank: "E",
          tribe: "Brave",
          attribute: "Fire",
          color: "#E85A3D",
          image: "",
          foodSlug: "",
          hp: 0,
          str: 0,
          spr: 0,
          def: 0,
          spd: 0,
          profile: [],
          evolution: null,
          fusions: [],
          moveset: emptyMoveset(),
          published: true,
        }}
      />
    </>
  );
}
