"use client";

import { useId, useState } from "react";
import AdminForm from "@/components/admin/AdminForm";
import { ColorField, ImageField, ImageInput, SelectField, TextField } from "@/components/admin/Fields";
import { ATTRIBUTES, RANKS, TRIBES, YOKAI_GAMES } from "@/lib/constants";
import type { ActionState } from "@/lib/admin";
import { emptyMoveset, type Evolution, type Fusion, type Moveset, type Part } from "@/lib/types";

type Option = { name: string; slug: string; image: string };

export type YokaiFormValue = {
  game: number;
  number: string;
  name: string;
  slug: string;
  rank: string;
  tribe: string;
  attribute: string;
  color: string;
  image: string;
  foodSlug: string;
  hp: number;
  str: number;
  spr: number;
  def: number;
  spd: number;
  profile: string[];
  evolution: Evolution;
  fusions: Fusion[];
  moveset: Moveset;
  published: boolean;
};

const emptyPart = (isYokai = true): Part => ({ name: "", slug: "", image: "", isYokai });

/** Ô chọn 1 yokai/vật phẩm: gõ tên (có gợi ý từ Medallium) → tự điền slug + ảnh. */
function PartInput({
  value,
  onChange,
  options,
  listId,
  label,
  allowItem,
}: {
  value: Part;
  onChange: (p: Part) => void;
  options: Option[];
  listId: string;
  label: string;
  allowItem?: boolean;
}) {
  const setName = (name: string) => {
    const hit = options.find((o) => o.name.toLowerCase() === name.trim().toLowerCase());
    onChange(hit ? { name: hit.name, slug: hit.slug, image: hit.image, isYokai: true } : { ...value, name });
  };
  return (
    <div className="a-sub" style={{ marginBottom: 0 }}>
      <div className="a-sub-head" style={{ fontSize: 12 }}>
        {label}
        {allowItem && (
          <label className="a-check" style={{ fontWeight: 400 }}>
            <input
              type="checkbox"
              checked={value.isYokai}
              onChange={(e) => onChange({ ...value, isYokai: e.target.checked, slug: e.target.checked ? value.slug : "" })}
            />
            là Yo-kai
          </label>
        )}
      </div>
      <div className="a-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="a-field">
          <span className="a-hint">Tên</span>
          <input type="text" list={listId} value={value.name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="a-field">
          <span className="a-hint">Slug (link)</span>
          <input type="text" value={value.slug} disabled={!value.isYokai} onChange={(e) => onChange({ ...value, slug: e.target.value })} />
        </div>
        <div className="a-field full">
          <span className="a-hint">Ảnh</span>
          <ImageInput value={value.image} onChange={(image) => onChange({ ...value, image })} />
        </div>
      </div>
    </div>
  );
}

function MoveRow({
  label,
  value,
  onChange,
  extra = [],
}: {
  label: string;
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  extra?: { key: string; label: string; image?: boolean; wide?: boolean }[];
}) {
  const fields = [
    { key: "name", label: "Tên" },
    { key: "power", label: "Sức mạnh" },
    { key: "target", label: "Mục tiêu" },
    ...extra,
  ];
  return (
    <div className="a-sub">
      <div className="a-sub-head">{label}</div>
      <div className="a-form-grid">
        {fields.map((f) => (
          <div key={f.key} className={"wide" in f && f.wide ? "a-field full" : "a-field"}>
            <span className="a-hint">{f.label}</span>
            {"image" in f && f.image ? (
              <ImageInput value={value[f.key] ?? ""} onChange={(v) => onChange({ ...value, [f.key]: v })} />
            ) : (
              <input type="text" value={value[f.key] ?? ""} onChange={(e) => onChange({ ...value, [f.key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function YokaiForm({
  action,
  initial,
  options,
  foods,
  extraActions,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  initial: YokaiFormValue;
  options: Option[];
  foods: { slug: string; name: string }[];
  extraActions?: React.ReactNode;
}) {
  const listId = "yk" + useId().replace(/:/g, "");
  const [evolution, setEvolution] = useState<Evolution>(initial.evolution);
  const [fusions, setFusions] = useState<Fusion[]>(initial.fusions);
  const [moveset, setMoveset] = useState<Moveset>({ ...emptyMoveset(), ...initial.moveset });
  const self: Part = { name: initial.name, slug: initial.slug, image: initial.image, isYokai: true };

  const setMove = (k: keyof Moveset) => (v: Record<string, string>) => setMoveset((m) => ({ ...m, [k]: v }));
  const setFusion = (i: number, k: keyof Fusion, p: Part) => setFusions((fs) => fs.map((f, j) => (j === i ? { ...f, [k]: p } : f)));

  return (
    <AdminForm action={action} extraActions={extraActions}>
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o.slug} value={o.name} />
        ))}
      </datalist>
      <input type="hidden" name="evolution" value={JSON.stringify(evolution)} />
      <input type="hidden" name="fusions" value={JSON.stringify(fusions)} />
      <input type="hidden" name="moveset" value={JSON.stringify(moveset)} />

      <div className="a-card">
        <h2>Thông tin cơ bản</h2>
        <div className="a-form-grid">
          <SelectField
            name="game"
            label="Game"
            defaultValue={String(initial.game)}
            options={YOKAI_GAMES.map((g) => ({ value: String(g.game), label: g.title }))}
          />
          <TextField name="number" label="Số thứ tự" defaultValue={initial.number} required hint='Ví dụ "001"' />
          <TextField name="name" label="Tên" defaultValue={initial.name} required />
          <TextField name="slug" label="Slug" defaultValue={initial.slug} hint="Để trống sẽ tự tạo từ tên" />
          <SelectField name="rank" label="Rank" options={RANKS} defaultValue={initial.rank} />
          <SelectField name="tribe" label="Tribe" options={TRIBES} defaultValue={initial.tribe} />
          <SelectField name="attribute" label="Attribute" options={ATTRIBUTES} defaultValue={initial.attribute} />
          <ColorField name="color" defaultValue={initial.color} label="Màu nền" />
          <SelectField
            name="foodSlug"
            label="Món ăn yêu thích"
            options={[{ value: "", label: "— Không —" }, ...foods.map((f) => ({ value: f.slug, label: f.name }))]}
            defaultValue={initial.foodSlug}
          />
          <div className="a-field" style={{ justifyContent: "flex-end" }}>
            <label className="a-check">
              <input type="checkbox" name="published" defaultChecked={initial.published} /> Hiển thị trên site
            </label>
          </div>
        </div>
        <div className="a-form-grid" style={{ marginTop: 14, gridTemplateColumns: "1fr" }}>
          <ImageField name="image" label="Ảnh Yo-kai" defaultValue={initial.image} />
        </div>
      </div>

      <div className="a-card">
        <h2>Chỉ số</h2>
        <div className="a-form-grid" style={{ gridTemplateColumns: "repeat(5, minmax(90px, 1fr))" }}>
          {(["hp", "str", "spr", "def", "spd"] as const).map((k) => (
            <TextField key={k} name={k} label={k.toUpperCase()} type="number" defaultValue={initial[k]} />
          ))}
        </div>
      </div>

      <div className="a-card">
        <h2>Profile</h2>
        <div className="a-field">
          <textarea name="profile" rows={4} defaultValue={initial.profile.join("\n")} />
          <span className="a-hint">Mỗi dòng là một đoạn văn.</span>
        </div>
      </div>

      <div className="a-card">
        <h2>Tiến hoá</h2>
        {evolution ? (
          <div className="a-sub">
            <div className="a-form-grid" style={{ gridTemplateColumns: "1fr 160px 1fr", alignItems: "start" }}>
              <PartInput
                label="Từ"
                listId={listId}
                options={options}
                value={{ ...evolution.from, isYokai: true }}
                onChange={(p) => setEvolution({ ...evolution, from: p })}
              />
              <div className="a-field">
                <span className="a-hint">Cấp độ</span>
                <input type="text" value={evolution.level} placeholder="Lv.17" onChange={(e) => setEvolution({ ...evolution, level: e.target.value })} />
              </div>
              <PartInput
                label="Thành"
                listId={listId}
                options={options}
                value={{ ...evolution.to, isYokai: true }}
                onChange={(p) => setEvolution({ ...evolution, to: p })}
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => setEvolution(null)}>
                Bỏ tiến hoá
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="a-btn a-btn-sm" onClick={() => setEvolution({ from: self, level: "", to: { name: "", slug: "", image: "" } })}>
            + Thêm tiến hoá theo cấp
          </button>
        )}

        <h2 style={{ marginTop: 18 }}>Hợp thể (Fusion)</h2>
        {fusions.map((f, i) => (
          <div key={i} className="a-sub">
            <div className="a-sub-head">
              Công thức {i + 1}
              <button type="button" className="a-btn a-btn-sm a-btn-danger" onClick={() => setFusions((fs) => fs.filter((_, j) => j !== i))}>
                Xoá
              </button>
            </div>
            <div className="a-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(220px, 1fr))", alignItems: "start" }}>
              <PartInput label="Thành phần A" allowItem listId={listId} options={options} value={f.a} onChange={(p) => setFusion(i, "a", p)} />
              <PartInput label="+ Thành phần B" allowItem listId={listId} options={options} value={f.b} onChange={(p) => setFusion(i, "b", p)} />
              <PartInput label="= Kết quả" listId={listId} options={options} value={f.result} onChange={(p) => setFusion(i, "result", p)} />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="a-btn a-btn-sm"
          onClick={() => setFusions((fs) => [...fs, { a: self, b: emptyPart(false), result: emptyPart() }])}
        >
          + Thêm công thức hợp thể
        </button>
      </div>

      <div className="a-card">
        <h2>Move set</h2>
        <MoveRow label="Attack" value={moveset.attack} onChange={setMove("attack")} />
        <MoveRow label="Technique" value={moveset.technique} onChange={setMove("technique")} extra={[{ key: "image", label: "Icon thuộc tính", image: true, wide: true }]} />
        <MoveRow label="Inspirit" value={moveset.inspirit} onChange={setMove("inspirit")} extra={[{ key: "description", label: "Mô tả", wide: true }]} />
        <MoveRow
          label="Soultimate"
          value={moveset.soultimate}
          onChange={setMove("soultimate")}
          extra={[
            { key: "image1", label: "Ảnh 1", image: true, wide: true },
            { key: "image2", label: "Ảnh 2 (vùng tác động)", image: true, wide: true },
            { key: "description", label: "Mô tả", wide: true },
          ]}
        />
        <MoveRow label="Skill" value={moveset.skill} onChange={setMove("skill")} extra={[{ key: "description", label: "Mô tả", wide: true }]} />
      </div>
    </AdminForm>
  );
}
