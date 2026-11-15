import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ATTRIBUTES, RANKS, TRIBES, YOKAI_GAMES, yokaiHref } from "@/lib/constants";
import { getTr } from "@/lib/admin-lang-server";

const PER_PAGE = 50;

export default async function YokaiList(props: PageProps<"/dashboard/yokai">) {
  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const { tr } = await getTr();
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const game = [1, 2, 3].includes(Number(sp.game)) ? Number(sp.game) : 3;
  const where: Prisma.YokaiWhereInput = {
    game,
    ...(q ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }, { number: { contains: q } }] } : {}),
    ...(sp.rank ? { rank: sp.rank } : {}),
    ...(sp.tribe ? { tribe: sp.tribe } : {}),
    ...(sp.attribute ? { attribute: sp.attribute } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.yokai.count({ where }),
    prisma.yokai.findMany({
      where,
      orderBy: { number: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: { id: true, game: true, number: true, name: true, slug: true, rank: true, tribe: true, attribute: true, color: true, image: true, published: true },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (p: number) => {
    const params = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    params.set("page", String(p));
    return `/dashboard/yokai?${params}`;
  };

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Yo-kai</h1>
          <p>{tr(`${total} yo-kai trong Yo-kai Watch ${game}`, `${total} yo-kai in Yo-kai Watch ${game}`)}</p>
        </div>
        <Link className="a-btn a-btn-primary" href={`/dashboard/yokai/new?game=${game}`}>
          {tr("+ Thêm Yo-kai", "+ Add Yo-kai")}
        </Link>
      </div>
      <div className="a-toolbar">
        {YOKAI_GAMES.map((g) => (
          <Link key={g.game} href={`/dashboard/yokai?game=${g.game}`} className={g.game === game ? "a-btn a-btn-primary" : "a-btn"}>
            {g.title}
          </Link>
        ))}
      </div>
      <form className="a-toolbar">
        <input type="hidden" name="game" value={game} />
        <input type="search" name="q" defaultValue={q} placeholder={tr("Tìm theo tên, slug, số...", "Search by name, slug, number...")} />
        <select name="rank" defaultValue={sp.rank ?? ""}>
          <option value="">{tr("Mọi rank", "All ranks")}</option>
          {RANKS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select name="tribe" defaultValue={sp.tribe ?? ""}>
          <option value="">{tr("Mọi tribe", "All tribes")}</option>
          {TRIBES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select name="attribute" defaultValue={sp.attribute ?? ""}>
          <option value="">{tr("Mọi attribute", "All attributes")}</option>
          {ATTRIBUTES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button className="a-btn">{tr("Lọc", "Filter")}</button>
        {(q || sp.rank || sp.tribe || sp.attribute) && (
          <Link className="a-btn" href={`/dashboard/yokai?game=${game}`}>
            {tr("Xoá lọc", "Clear filters")}
          </Link>
        )}
      </form>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{tr("Ảnh", "Image")}</th>
              <th>{tr("Tên", "Name")}</th>
              <th>Rank</th>
              <th>Tribe</th>
              <th>Attribute</th>
              <th>{tr("Màu", "Color")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((y) => (
              <tr key={y.id}>
                <td>{y.number}</td>
                <td>{y.image && <img className="a-row-img" src={y.image} alt="" loading="lazy" />}</td>
                <td>
                  <Link href={`/dashboard/yokai/${y.id}`}>
                    <b>{y.name}</b>
                  </Link>
                  <div className="a-hint">/{y.slug}</div>
                </td>
                <td>{y.rank}</td>
                <td>{y.tribe}</td>
                <td>{y.attribute}</td>
                <td>
                  <span className="a-swatch" style={{ background: y.color }} />
                </td>
                <td className="a-right">
                  {!y.published && <span className="a-pill a-pill-off">{tr("Ẩn", "Hidden")}</span>}{" "}
                  <a className="a-btn a-btn-sm" href={yokaiHref(y.game, y.slug)} target="_blank" rel="noreferrer">
                    {tr("Xem", "View")}
                  </a>{" "}
                  <Link className="a-btn a-btn-sm" href={`/dashboard/yokai/${y.id}`}>
                    {tr("Sửa", "Edit")}
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="a-hint">
                  {tr("Không có kết quả.", "No results.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="a-pager">
        {tr("Trang", "Page")} {page}/{pages}
        {page > 1 && (
          <Link className="a-btn a-btn-sm" href={link(page - 1)}>
            {tr("← Trước", "← Prev")}
          </Link>
        )}
        {page < pages && (
          <Link className="a-btn a-btn-sm" href={link(page + 1)}>
            {tr("Sau →", "Next →")}
          </Link>
        )}
      </div>
    </>
  );
}
