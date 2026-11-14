import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import RowsEditor, { type Column } from "@/components/admin/RowsEditor";
import { BAFFLE_GAMES } from "@/lib/constants";
import { saveBaffle } from "../collections";
import { getTr } from "@/lib/admin-lang-server";

export default async function BaffleAdmin(props: PageProps<"/dashboard/baffle-board">) {
  const sp = (await props.searchParams) as { game?: string };
  const { tr } = await getTr();
  const game = BAFFLE_GAMES.find((g) => g.id === sp.game) ?? BAFFLE_GAMES[0];
  const rows = await prisma.baffleBoard.findMany({ where: { game: game.id }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  const columns: Column[] = [
    ...(game.hasLocation ? [{ key: "location", label: tr("Địa điểm", "Location"), type: "textarea" as const }] : []),
    { key: "clues", label: tr("Gợi ý (mỗi dòng 1 gợi ý)", "Clues (one per line)"), type: "lines" },
    { key: "solution", label: tr("Đáp án", "Answer"), width: 140 },
    { key: "slug", label: tr("Slug yokai", "Yo-kai slug"), width: 140 },
    ...(game.hasLocation ? [{ key: "effect", label: tr("Hiệu ứng", "Effect"), type: "textarea" as const }] : []),
  ];
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Baffle Board</h1>
          <p>{tr("Câu đố bảng chữ theo từng game", "Baffle board puzzles per game")}</p>
        </div>
      </div>
      <div className="a-toolbar">
        {BAFFLE_GAMES.map((g) => (
          <Link key={g.id} href={`/dashboard/baffle-board?game=${g.id}`} className={g.id === game.id ? "a-btn a-btn-primary" : "a-btn"}>
            {g.title}
          </Link>
        ))}
      </div>
      <AdminForm action={saveBaffle} key={game.id}>
        <input type="hidden" name="game" value={game.id} />
        <div className="a-card">
          <RowsEditor
            name="rows"
            addLabel={tr("+ Thêm câu đố", "+ Add puzzle")}
            initial={rows.map((r) => ({
              location: r.location,
              clues: (r.clues as string[]) ?? [],
              solution: r.solution,
              slug: r.slug,
              effect: r.effect,
            }))}
            columns={columns}
          />
        </div>
      </AdminForm>
    </>
  );
}
