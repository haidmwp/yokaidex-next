import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { emptyMoveset } from "@/lib/types";
import YokaiForm from "../YokaiForm";
import { saveYokai } from "../actions";
import { formOptions } from "../shared";

export default async function NewYokai() {
  const { options, foods } = await formOptions();
  const last = await prisma.yokai.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
  const next = String((parseInt(last?.number ?? "0", 10) || 0) + 1).padStart(3, "0");
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Thêm Yo-kai</h1>
          <p>
            <Link href="/admin/yokai">← Danh sách</Link>
          </p>
        </div>
      </div>
      <YokaiForm
        action={saveYokai.bind(null, null)}
        options={options}
        foods={foods}
        initial={{
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
