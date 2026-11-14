import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import PageHeader from "@/components/site/PageHeader";
import { getSpecialSouls } from "@/lib/data";
import { pageTitle, yokaiHref } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("RARE Special Soul") };

function Soul({ name, slug, image }: { name: string; slug: string; image: string }) {
  const inner = (
    <>
      {image && <img alt={name} className="img-rare-special-soul" src={image} />}
      <span className="rare-special-soul-title">{name}</span>
    </>
  );
  return (
    <span>
      {slug ? (
        <Link className="special-soul" href={yokaiHref(3, slug)}>
          {inner}
        </Link>
      ) : (
        <span className="special-soul">{inner}</span>
      )}
    </span>
  );
}

export default async function RareSpecialSoulPage() {
  const souls = await getSpecialSouls();
  return (
    <div id="rare-special-soul" className="content-wrapper">
      <PageHeader title="RARE Special Soul" color="#7A9BBF" />
      <div className="rare-special-soul-content">
        <div className="container">
          <div className="rare-special-soul-header">
            <span className="special-soul">Soul</span>
            <span className="rare-special-soul-plus"></span>
            <span className="special-soul">Fused with</span>
            <span className="rare-special-soul-equal"></span>
            <span className="special-soul">Result</span>
          </div>
          {souls.map((s) => (
            <Fragment key={s.id}>
              <div className="rare-special-soul">
                <Soul name={s.soul1Name} slug={s.soul1Slug} image={s.soul1Image} />
                <span className="rare-special-soul-plus">+</span>
                <Soul name={s.soul2Name} slug={s.soul2Slug} image={s.soul2Image} />
                <span className="rare-special-soul-equal">=</span>
                <span className="special-soul">
                  {s.resultImage && <img alt={s.resultName} className="img-rare-special-soul" src={s.resultImage} />}
                  <span className="rare-special-soul-title">{s.resultName}</span>
                </span>
              </div>
              <div className="rare-special-soul-desc">
                <span>{s.description}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
