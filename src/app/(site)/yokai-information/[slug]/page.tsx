import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/site/PageHeader";
import ShareButtons from "@/components/site/ShareButtons";
import { getYokai, getYokaiSlugs } from "@/lib/data";
import { SITE_URL, attributeImage, pageTitle, rankImage, tribeImage } from "@/lib/constants";
import type { Part } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getYokaiSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/yokai-information/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const y = await getYokai(slug);
  if (!y) return { title: pageTitle("Page not found!") };
  return {
    title: pageTitle(y.name),
    description: y.profile[0] || undefined,
    openGraph: { title: y.name, description: y.profile[0] || undefined, images: y.image ? [y.image] : undefined },
  };
}

/** Một ô trong chuỗi tiến hoá / hợp thể – có link nếu là yokai khác. */
function Cell({ part, current }: { part: Pick<Part, "name" | "slug" | "image">; current: string }) {
  const inner = (
    <>
      {part.image && <img className="img-evolution" alt={part.name} src={part.image} />}
      <p>{part.name}</p>
    </>
  );
  return (
    <div className="evolution">
      {part.slug && part.slug !== current ? <Link href={`/yokai-information/${part.slug}`}>{inner}</Link> : inner}
    </div>
  );
}

function Title({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <h2 className="yokai-detail-title" style={{ backgroundColor: color }}>
      {children}
    </h2>
  );
}

const STAT_CLASS = ["stats-hp", "stats-str", "stats-spr", "stats-def", "stats-spd"];

async function YokaiDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const y = await getYokai(slug);
  if (!y) notFound();
  const m = y.moveset;
  const stats: [string, number][] = [
    ["HP", y.hp],
    ["Str", y.str],
    ["Spr", y.spr],
    ["Def", y.def],
    ["Spd", y.spd],
  ];

  return (
    <>
      <PageHeader title={y.name} color={y.color} />
      <div className="yokai-detail-wrapper">
        <div className="container">
          <div className="img-yokai-detail-wrapper" style={{ backgroundColor: y.color }}>
            <div className="bg-img-yokai-detail"></div>
            <img className="img-yokai-detail" alt={y.name} src={y.image} />
            <span className="yokai-number">#{y.number}</span>
            <img alt={y.tribe} className="img-tribe-detail" src={tribeImage(y.tribe)} />
            <img alt={y.attribute} className="img-attribute-detail" src={attributeImage(y.attribute)} />
            <img alt={y.rank} className="img-rank-detail" src={rankImage(y.rank)} />
          </div>

          {y.food && (
            <div className="yokai-detail-food-wrapper">
              <Title color={y.color}>FAVORITE FOOD</Title>
              <div className="yokai-detail-food-content">
                <Link href={`/food/${y.food.slug}`} className="yokai-food">
                  <img className="img-yokai-detail-food" alt={y.food.name} src={y.food.image} />
                  {y.food.name}
                </Link>
              </div>
            </div>
          )}

          <div className="yokai-detail-stats-wrapper">
            <Title color={y.color}>STATS</Title>
            <div className="yokai-detail-stats">
              {stats.map(([label, value], i) => (
                <div key={label} className={STAT_CLASS[i]}>
                  <p>{label}</p>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {(y.evolution || y.fusions.length > 0) && (
            <div className="yokai-detail-evolution-wrapper">
              <Title color={y.color}>EVOLUTION</Title>
              {y.evolution && (
                <div className="yokai-detail-evolution">
                  <Cell part={y.evolution.from} current={y.slug} />
                  <div className="evolution arrow">
                    <p>{y.evolution.level}</p>
                    <img className="img-evolution-arrow" alt="arrow" src="/img/arrowright.png" />
                  </div>
                  <Cell part={y.evolution.to} current={y.slug} />
                </div>
              )}
              {y.fusions.map((f, i) => (
                <div key={i} className="yokai-detail-evolution">
                  <Cell part={f.a} current={y.slug} />
                  <div className="evolution plus">+</div>
                  <Cell part={f.b} current={y.slug} />
                  <div className="evolution equal">=</div>
                  <Cell part={f.result} current={y.slug} />
                </div>
              ))}
            </div>
          )}

          {y.profile.length > 0 && (
            <div className="yokai-detail-profile-wrapper">
              <Title color={y.color}>PROFILE (Yo-kai Watch 3)</Title>
              <div className="yokai-detail-profile-content">
                {y.profile.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          <div className="yokai-detail-moveset-wrapper">
            <Title color={y.color}>MOVE SET</Title>
            <div className="yokai-detail-moveset-content">
              <table cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: "#d7c48a" }}>Attack</td>
                    <td>{m.attack.name}</td>
                    <td>{m.attack.power}</td>
                    <td></td>
                    <td>{m.attack.target}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: "#7eaec5" }}>Technique</td>
                    <td>{m.technique.name}</td>
                    <td>{m.technique.power}</td>
                    <td className="img-technique-wrapper">
                      {m.technique.image && <img alt="technique" className="img-technique" src={m.technique.image} />}
                    </td>
                    <td>{m.technique.target}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: "#be9ea1" }}>Inspirit</td>
                    <td>{m.inspirit.name}</td>
                    <td>{m.inspirit.power}</td>
                    <td></td>
                    <td>{m.inspirit.target}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      {m.inspirit.description}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: "#addfad" }}>Soultimate</td>
                    <td>{m.soultimate.name}</td>
                    <td>{m.soultimate.power}</td>
                    <td className="img-soultimate-1-wrapper">
                      {m.soultimate.image1 && <img alt="soultimate" className="img-soultimate-1" src={m.soultimate.image1} />}
                    </td>
                    <td>
                      {m.soultimate.target && <span>{m.soultimate.target}</span>}
                      {m.soultimate.image2 && <img alt="soultimate" className="img-soultimate-2" src={m.soultimate.image2} />}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      {m.soultimate.description}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: "#addfad" }}>Skill</td>
                    <td>{m.skill.name}</td>
                    <td>{m.skill.power}</td>
                    <td></td>
                    <td>{m.skill.target}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      {m.skill.description}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="yokai-detail-share-wrapper">
            <Title color={y.color}>SHARE ON SOCIALS</Title>
            <ShareButtons url={`${SITE_URL}/yokai-information/${y.slug}`} title={`View ${y.name} detail in YokaiDex`} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function YokaiPage(props: PageProps<"/yokai-information/[slug]">) {
  return (
    <div id="yokai-detail" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <YokaiDetail params={props.params} />
      </Suspense>
    </div>
  );
}
