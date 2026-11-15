"use client";

import { useState } from "react";
import { ColorInput, ImageInput } from "./Fields";
import ImagesInput from "./ImagesInput";
import { useTr } from "./AdminLang";

export type Column = {
  key: string;
  label: string;
  /** images: danh sách nhiều ảnh (string[]) có upload */
  type?: "text" | "textarea" | "number" | "color" | "image" | "images" | "lines" | "select";
  options?: readonly string[];
  width?: number | string;
  placeholder?: string;
};

type Row = Record<string, unknown> & { _k: number };

let seq = 0;
const withKey = (r: Record<string, unknown>): Row => ({ ...r, _k: ++seq });

function blank(columns: Column[]) {
  const r: Record<string, unknown> = {};
  for (const c of columns) r[c.key] = c.type === "lines" || c.type === "images" ? [] : c.type === "number" ? 0 : c.type === "select" ? c.options?.[0] ?? "" : "";
  return r;
}

/**
 * Bảng chỉnh sửa nhiều dòng (thêm / xoá / sắp xếp). Dữ liệu được serialize vào
 * input ẩn `name` dạng JSON để server action đọc lại.
 */
export default function RowsEditor({
  name,
  columns,
  initial,
  addLabel,
  defaults,
}: {
  name: string;
  columns: Column[];
  initial: Record<string, unknown>[];
  addLabel?: string;
  defaults?: Record<string, unknown>;
}) {
  const [rows, setRows] = useState<Row[]>(() => initial.map(withKey));
  const { tr } = useTr();

  const set = (i: number, key: string, value: unknown) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const move = (i: number, d: number) =>
    setRows((rs) => {
      const j = i + d;
      if (j < 0 || j >= rs.length) return rs;
      const copy = [...rs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const add = () => setRows((rs) => [...rs, withKey({ ...blank(columns), ...defaults })]);
  const remove = (i: number) => setRows((rs) => rs.filter((_, j) => j !== i));

  const serialized = JSON.stringify(
    rows.map((row) => {
      const r: Record<string, unknown> = { ...row };
      delete r._k;
      return r;
    }),
  );

  return (
    <div>
      <input type="hidden" name={name} value={serialized} />
      <div style={{ overflowX: "auto" }}>
        <table className="a-rows">
          <thead>
            <tr>
              <th>#</th>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width }}>
                  {c.label}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r._k}>
                <td className="a-idx">{i + 1}</td>
                {columns.map((c) => {
                  const v = r[c.key];
                  return (
                    <td key={c.key} style={{ width: c.width, minWidth: c.type === "image" ? 240 : c.type === "images" ? 320 : 120 }}>
                      {c.type === "textarea" ? (
                        <textarea rows={2} value={String(v ?? "")} placeholder={c.placeholder} onChange={(e) => set(i, c.key, e.target.value)} />
                      ) : c.type === "lines" ? (
                        <textarea
                          rows={3}
                          value={((v as string[]) ?? []).join("\n")}
                          placeholder={c.placeholder ?? tr("Mỗi dòng một giá trị", "One value per line")}
                          onChange={(e) => set(i, c.key, e.target.value.split("\n"))}
                        />
                      ) : c.type === "images" ? (
                        <ImagesInput value={(v as string[]) ?? []} onChange={(x) => set(i, c.key, x)} />
                      ) : c.type === "image" ? (
                        <ImageInput value={String(v ?? "")} onChange={(x) => set(i, c.key, x)} />
                      ) : c.type === "color" ? (
                        <ColorInput value={String(v ?? "")} onChange={(x) => set(i, c.key, x)} />
                      ) : c.type === "select" ? (
                        <select value={String(v ?? "")} onChange={(e) => set(i, c.key, e.target.value)}>
                          {c.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={c.type === "number" ? "number" : "text"}
                          value={String(v ?? "")}
                          placeholder={c.placeholder}
                          onChange={(e) => set(i, c.key, c.type === "number" ? Number(e.target.value) : e.target.value)}
                        />
                      )}
                    </td>
                  );
                })}
                <td className="a-row-ctl">
                  <button type="button" className="a-btn a-btn-icon" title={tr("Lên", "Move up")} onClick={() => move(i, -1)}>
                    ↑
                  </button>{" "}
                  <button type="button" className="a-btn a-btn-icon" title={tr("Xuống", "Move down")} onClick={() => move(i, 1)}>
                    ↓
                  </button>{" "}
                  <button type="button" className="a-btn a-btn-icon a-btn-danger" title={tr("Xoá", "Delete")} onClick={() => remove(i)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="a-rows-foot">
        <button type="button" className="a-btn a-btn-sm" onClick={add}>
          {addLabel ?? tr("+ Thêm dòng", "+ Add row")}
        </button>
        <span className="a-hint">{tr(`${rows.length} dòng · nhớ bấm “Lưu thay đổi”`, `${rows.length} rows · remember to click “Save changes”`)}</span>
      </div>
    </div>
  );
}
