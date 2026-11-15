"use client";

import { type YokaiMark, useMyYokai } from "@/lib/local-store";

const BADGE =
  "M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z";

/** Huy hiệu răng cưa nền trắng, bên trong là dấu tích (Got it, xanh lá) hoặc ngôi sao (Want, vàng) cùng màu nền nút. */
function BadgeIcon({ kind }: { kind: YokaiMark }) {
  return (
    <svg className="yokai-verified-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#FFF" d={BADGE} />
      {kind === "got" ? (
        <path d="M7.6 12.3l3 3 5.8-6" fill="none" stroke="#2E9E5B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path
          fill="#E8A317"
          d="M12 6.6l1.62 3.3 3.63.53-2.63 2.56.62 3.62L12 14.9l-3.24 1.71.62-3.62-2.63-2.56 3.63-.53z"
        />
      )}
    </svg>
  );
}

/** Đánh dấu Yo-kai đã có / muốn săn – lưu trên trình duyệt, lọc được ở trang Medallium. */
export default function YokaiMarkButtons({ game, slug, color }: { game: number; slug: string; color?: string }) {
  const [my, update] = useMyYokai();
  const mark = my[game]?.[slug];

  const set = (m: YokaiMark) =>
    update((prev) => {
      const list = { ...(prev[game] ?? {}) };
      if (list[slug] === m) delete list[slug];
      else list[slug] = m;
      const next = { ...prev };
      if (Object.keys(list).length) next[game] = list;
      else delete next[game];
      return next;
    });

  return (
    <div className="yokai-mark-buttons" style={color ? ({ "--mark-bg": color } as React.CSSProperties) : undefined}>
      <button type="button" className={mark === "got" ? "yokai-mark-btn on-got" : "yokai-mark-btn"} aria-pressed={mark === "got"} onClick={() => set("got")}>
        {mark === "got" && <BadgeIcon kind="got" />}
        Got it
      </button>
      <button type="button" className={mark === "want" ? "yokai-mark-btn on-want" : "yokai-mark-btn"} aria-pressed={mark === "want"} onClick={() => set("want")}>
        {mark === "want" && <BadgeIcon kind="want" />}
        Want
      </button>
    </div>
  );
}
