"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ATTRIBUTES, RANKS, TRIBES, attributeImage, rankImage, tribeImage } from "@/lib/constants";
import type { YokaiCard } from "@/lib/types";
import { type YokaiMark, useMyYokai } from "@/lib/local-store";

const MARK_BADGE: Record<YokaiMark, { icon: string; label: string }> = {
  got: { icon: "✓", label: "Got it" },
  want: { icon: "★", label: "Want" },
};

function MarkBadge({ mark }: { mark?: YokaiMark }) {
  if (!mark) return null;
  return (
    <span className={`yokai-mark-badge yokai-mark-${mark}`} title={MARK_BADGE[mark].label}>
      {MARK_BADGE[mark].icon}
    </span>
  );
}

function EmptyList() {
  return (
    <li className="no-yokai-wrapper">
      <img alt="not found" className="icon-notfound" src="/img/ui/icon-notfound.webp" />
      No yo-kais found!
    </li>
  );
}

export default function MedalliumList({ yokais, basePath }: { yokais: YokaiCard[]; basePath: string }) {
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("");
  const [attribute, setAttribute] = useState("");
  const [tribe, setTribe] = useState("");
  const [mine, setMine] = useState("");
  const game = basePath.match(/yokai-watch-(\d)/)?.[1] ?? "";
  const [myYokai] = useMyYokai();
  const marks = useMemo(() => myYokai[game] ?? {}, [myYokai, game]);
  const gotCount = yokais.filter((y) => marks[y.slug] === "got").length;
  const wantCount = yokais.filter((y) => marks[y.slug] === "want").length;

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return yokais.filter(
      (y) =>
        (!q || y.name.toLowerCase().includes(q) || y.number.includes(q) || y.slug.includes(q)) &&
        (!rank || y.rank === rank) &&
        (!attribute || y.attribute === attribute) &&
        (!tribe || y.tribe === tribe) &&
        (!mine || (mine === "none" ? !marks[y.slug] : marks[y.slug] === mine)),
    );
  }, [yokais, search, rank, attribute, tribe, mine, marks]);

  return (
    <div className="medallium-list">
      <div className="container">
        <div className="yokai-filter-wrapper">
          <div className="yokai-filter-left">
            <img alt="search" className="icon-search" src="/img/ui/icon-search.svg" />
            <input onChange={(e) => setSearch(e.target.value)} className="yokai-search" placeholder={`Search in ${list.length} yo-kai...`} aria-label="Search yo-kai" />
            <select onChange={(e) => setMine(e.target.value)} name="mine" id="filter-mine" aria-label="My Yo-kai">
              <option value="">All Yo-kai</option>
              <option value="got">Got it ({gotCount})</option>
              <option value="want">Want ({wantCount})</option>
              <option value="none">Not got yet</option>
            </select>
          </div>
          <div className="yokai-filter-right">
            <select onChange={(e) => setRank(e.target.value)} name="rank" id="filter-rank">
              <option value="">All rank</option>
              {RANKS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select onChange={(e) => setAttribute(e.target.value)} name="attribute" id="filter-attribute">
              <option value="">All attribute</option>
              {ATTRIBUTES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select onChange={(e) => setTribe(e.target.value)} name="tribe" id="filter-tribe">
              <option value="">All tribe</option>
              {TRIBES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop */}
        <div className="yokai-list-pc-wrapper">
          <ul>
            {list.length === 0 && <EmptyList />}
            {list.map((y) => (
              <li key={y.number} style={{ backgroundColor: y.color }} className="yokai-content-pc-wrapper">
                <span className="bg-color-pc"></span>
                <MarkBadge mark={marks[y.slug]} />
                <Link className="yokai-content-pc" href={`${basePath}/${y.slug}`}>
                  <span className="img-yokai-wrapper-pc">
                    <img className="img-yokai-pc" alt={y.name} src={y.image} loading="lazy" />
                  </span>
                  <span className="meddallium-yokai-number-pc" style={{ backgroundColor: y.color }}>#{y.number}</span>
                  <div className="yokai-name-pc-wrapper">
                    <h3 className="yokai-name-pc">{y.name}</h3>
                  </div>
                  <span>
                    <img className="img-rank-pc" alt={y.rank} src={rankImage(y.rank)} />
                    <img className="img-trible-pc" alt={y.tribe} src={tribeImage(y.tribe)} />
                    <img className="img-attribute-pc" alt={y.attribute} src={attributeImage(y.attribute)} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile */}
        <div className="yokai-list-wrapper">
          <ul>
            {list.length === 0 && <EmptyList />}
            {list.map((y) => (
              <li key={y.number} style={{ backgroundColor: y.color }}>
                <Link className="yokai-content" href={`${basePath}/${y.slug}`}>
                  <span className="yokai-left-wrapper">
                    <span className="img-yokai-wrapper">
                      <img className="img-yokai" alt={y.name} src={y.image} loading="lazy" />
                    </span>
                    <span className="yokai-name-wrapper">
                      <span className="meddallium-yokai-number" style={{ backgroundColor: y.color }}>#{y.number}</span>
                      <h3 className="yokai-name">{y.name}</h3>
                    </span>
                  </span>
                  <span className="yokai-right-wrapper">
                    <img className="img-rank" alt={y.rank} src={rankImage(y.rank)} />
                    <img className="img-attribute" alt={y.attribute} src={attributeImage(y.attribute)} />
                    <img className="img-trible" alt={y.tribe} src={tribeImage(y.tribe)} />
                  </span>
                  <span className="bg-color"></span>
                  <MarkBadge mark={marks[y.slug]} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
