"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ATTRIBUTES, RANKS, TRIBES, attributeImage, rankImage, tribeImage } from "@/lib/constants";
import type { YokaiCard } from "@/lib/types";

function EmptyList() {
  return (
    <li className="no-yokai-wrapper">
      <img alt="not found" className="icon-notfound" src="/img/ui/icon-notfound.webp" />
      No yo-kais found!
    </li>
  );
}

export default function MedalliumList({ yokais }: { yokais: YokaiCard[] }) {
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("");
  const [attribute, setAttribute] = useState("");
  const [tribe, setTribe] = useState("");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return yokais.filter(
      (y) =>
        (!q || y.name.toLowerCase().includes(q) || y.number.includes(q) || y.slug.includes(q)) &&
        (!rank || y.rank === rank) &&
        (!attribute || y.attribute === attribute) &&
        (!tribe || y.tribe === tribe),
    );
  }, [yokais, search, rank, attribute, tribe]);

  return (
    <div className="medallium-list">
      <div className="container">
        <div className="yokai-filter-wrapper">
          <div className="yokai-filter-left">
            <img alt="search" className="icon-search" src="/img/ui/icon-search.svg" />
            <input onChange={(e) => setSearch(e.target.value)} className="yokai-search" placeholder="Search..." />
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
                <Link className="yokai-content-pc" href={`/yokai-information/${y.slug}`}>
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
                <Link className="yokai-content" href={`/yokai-information/${y.slug}`}>
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
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
