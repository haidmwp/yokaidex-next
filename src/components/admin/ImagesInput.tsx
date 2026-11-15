"use client";

import { useRef, useState } from "react";
import { uploadFile } from "./Fields";
import { useTr } from "./AdminLang";

/**
 * Danh sách nhiều ảnh (vd. các trang QR của một bộ): xem trước, upload nhiều file một lúc,
 * đổi thứ tự, xoá, hoặc thêm bằng đường dẫn.
 */
export default function ImagesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { tr } = useTr();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const list = value.filter(Boolean);

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const remove = (i: number) => onChange(list.filter((_, k) => k !== i));
  const addUrl = () => {
    const url = window.prompt(tr("Nhập URL ảnh:", "Enter image URL:"))?.trim();
    if (url) onChange([...list, url]);
  };

  return (
    <div className="a-images">
      <div className="a-images-grid">
        {list.map((src, i) => (
          <div key={src + i} className="a-images-item">
            <a href={src} target="_blank" rel="noreferrer" title={src}>
              <img src={src} alt="" loading="lazy" />
            </a>
            <span className="a-images-idx">{i + 1}</span>
            <div className="a-images-ctl">
              <button type="button" title={tr("Lên", "Move up")} disabled={i === 0} onClick={() => move(i, -1)}>
                ←
              </button>
              <button type="button" title={tr("Xuống", "Move down")} disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                →
              </button>
              <button type="button" className="danger" title={tr("Xoá ảnh", "Remove image")} onClick={() => remove(i)}>
                ×
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <span className="a-hint">{tr("Chưa có ảnh.", "No images yet.")}</span>}
      </div>
      <div className="a-images-actions">
        <button type="button" className="a-btn a-btn-sm" disabled={!!busy} onClick={() => fileRef.current?.click()}>
          {busy ?? tr("Upload ảnh", "Upload images")}
        </button>
        <button type="button" className="a-btn a-btn-sm" disabled={!!busy} onClick={addUrl}>
          {tr("+ Thêm bằng URL", "+ Add by URL")}
        </button>
        <span className="a-hint">{tr(`${list.length} ảnh`, `${list.length} images`)}</span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          const added: string[] = [];
          try {
            for (let i = 0; i < files.length; i++) {
              setBusy(`${i + 1}/${files.length}…`);
              added.push(await uploadFile(files[i]));
            }
          } catch (err) {
            alert((err as Error).message);
          } finally {
            setBusy(null);
            if (added.length) onChange([...list, ...added]);
          }
        }}
      />
    </div>
  );
}
