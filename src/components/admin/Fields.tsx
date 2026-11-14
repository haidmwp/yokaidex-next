"use client";

import { useId, useRef, useState } from "react";
import { PALETTE } from "@/lib/constants";
import { useTr } from "./AdminLang";

/** Upload file lên /api/admin/upload, trả về đường dẫn public. */
export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

type ImageInputProps = {
  value: string;
  onChange: (v: string) => void;
  name?: string;
  placeholder?: string;
};

/** Ô nhập đường dẫn ảnh + xem trước + nút upload. */
export function ImageInput({ value, onChange, name, placeholder }: ImageInputProps) {
  const { tr } = useTr();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="a-image-field">
      {value ? <img className="a-thumb" src={value} alt="" /> : <span className="a-thumb" />}
      <input type="text" name={name} value={value} placeholder={placeholder ?? tr("/img/... hoặc https://...", "/img/... or https://...")} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="a-btn a-btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? "..." : "Upload"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            onChange(await uploadFile(f));
          } catch (err) {
            alert((err as Error).message);
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

/** Phiên bản không kiểm soát (dùng trong form thường, có name). */
export function ImageField({ name, defaultValue = "", label, hint }: { name: string; defaultValue?: string; label?: string; hint?: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className="a-field">
      {label && <label>{label}</label>}
      <ImageInput name={name} value={v} onChange={setV} />
      {hint && <span className="a-hint">{hint}</span>}
    </div>
  );
}

export function ColorInput({ value, onChange, name }: { value: string; onChange: (v: string) => void; name?: string }) {
  const id = "pal" + useId().replace(/:/g, "");
  return (
    <div className="a-color">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} />
      <input type="text" name={name} value={value} list={id} onChange={(e) => onChange(e.target.value)} />
      <datalist id={id}>
        {PALETTE.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}

export function ColorField({ name, defaultValue = "#E85A3D", label }: { name: string; defaultValue?: string; label?: string }) {
  const { tr } = useTr();
  const [v, setV] = useState(defaultValue);
  return (
    <div className="a-field">
      <label>{label ?? tr("Màu", "Color")}</label>
      <ColorInput name={name} value={v} onChange={setV} />
    </div>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  required,
  hint,
  type = "text",
  full,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  required?: boolean;
  hint?: string;
  type?: string;
  full?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={full ? "a-field full" : "a-field"}>
      <label htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <input id={name} type={type} name={name} defaultValue={defaultValue} required={required} placeholder={placeholder} />
      {hint && <span className="a-hint">{hint}</span>}
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: readonly (string | { value: string; label: string })[];
  defaultValue?: string;
}) {
  return (
    <div className="a-field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue}>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
