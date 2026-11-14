import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ATTRIBUTES, RANKS, TRIBES } from "@/lib/constants";

const PER_PAGE = 50;

export default async function YokaiList(props: PageProps<"/admin/yokai">) {
  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const where: Prisma.YokaiWhereInput = {
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
      select: { id: true, number: true, name: true, slug: true, rank: true, tribe: true, attribute: true, color: true, image: true, published: true },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const link = (p: number) => {
    const params = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    params.set("page", String(p));
    return `/admin/yokai?${params}`;
  };

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Yo-kai</h1>
          <p>{total} yo-kai</p>
        </div>
        <Link className="a-btn a-btn-primary" href="/admin/yokai/new">
          + Thêm Yo-kai
        </Link>
      </div>
      <form className="a-toolbar">
        <input type="search" name="q" defaultValue={q} placeholder="Tìm theo tên, slug, số..." />
        <select name="rank" defaultValue={sp.rank ?? ""}>
          <option value="">Mọi rank</option>
          {RANKS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select name="tribe" defaultValue={sp.tribe ?? ""}>
          <option value="">Mọi tribe</option>
          {TRIBES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select name="attribute" defaultValue={sp.attribute ?? ""}>
          <option value="">Mọi attribute</option>
          {ATTRIBUTES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button className="a-btn">Lọc</button>
        {(q || sp.rank || sp.tribe || sp.attribute) && (
          <Link className="a-btn" href="/admin/yokai">
            Xoá lọc
          </Link>
        )}
      </form>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>#</th>
              <th></th>
              <th>Tên</th>
              <th>Rank</th>
              <th>Tribe</th>
              <th>Attribute</th>
              <th>Màu</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((y) => (
              <tr key={y.id}>
                <td>{y.number}</td>
                <td>{y.image && <img className="a-row-img" src={y.image} alt="" loading="lazy" />}</td>
                <td>
                  <Link href={`/admin/yokai/${y.id}`}>
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
                  {!y.published && <span className="a-pill a-pill-off">Ẩn</span>}{" "}
                  <a className="a-btn a-btn-sm" href={`/yokai-information/${y.slug}`} target="_blank" rel="noreferrer">
                    Xem
                  </a>{" "}
                  <Link className="a-btn a-btn-sm" href={`/admin/yokai/${y.id}`}>
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="a-hint">
                  Không có kết quả.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="a-pager">
        Trang {page}/{pages}
        {page > 1 && (
          <Link className="a-btn a-btn-sm" href={link(page - 1)}>
            ← Trước
          </Link>
        )}
        {page < pages && (
          <Link className="a-btn a-btn-sm" href={link(page + 1)}>
            Sau →
          </Link>
        )}
      </div>
    </>
  );
}
