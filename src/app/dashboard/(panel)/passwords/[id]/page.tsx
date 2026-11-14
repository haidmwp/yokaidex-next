import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { ColorField, SelectField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import { PASSWORD_GAMES } from "@/lib/constants";
import { deleteRegion, saveRegion } from "../actions";

export default async function EditRegion(props: PageProps<"/dashboard/passwords/[id]">) {
  const { id } = await props.params;
  const isNew = id === "new";
  const r = isNew
    ? { id: 0, game: 1, code: "", label: "", color: "#758EFF", sortOrder: 99, passwords: [] }
    : await prisma.passwordRegion.findUnique({
        where: { id: Number(id) },
        include: { passwords: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
      });
  if (!r) notFound();
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{isNew ? "Thêm vùng password" : `Yo-kai Watch ${r.game} · ${r.label}`}</h1>
          <p>
            <Link href="/dashboard/passwords">← Danh sách</Link>
            {!isNew && (
              <>
                {" · "}
                <a href={`/password-${r.game}/${r.code}`} target="_blank" rel="noreferrer">
                  Xem trên site ↗
                </a>
              </>
            )}
          </p>
        </div>
      </div>
      <AdminForm
        action={saveRegion.bind(null, isNew ? null : r.id)}
        extraActions={!isNew && <DeleteButton action={deleteRegion.bind(null, r.id)} label="Xoá vùng" />}
      >
        <div className="a-card">
          <div className="a-form-grid">
            <SelectField
              name="game"
              label="Game"
              defaultValue={String(r.game)}
              options={PASSWORD_GAMES.map((g) => ({ value: String(g.game), label: `Yo-kai Watch ${g.game}` }))}
            />
            <TextField name="code" label="Mã vùng (URL)" defaultValue={r.code} required hint="vd: en-us" />
            <TextField name="label" label="Nhãn hiển thị" defaultValue={r.label} required hint="vd: EN (US)" />
            <ColorField name="color" defaultValue={r.color} />
            <TextField name="sortOrder" label="Thứ tự" type="number" defaultValue={r.sortOrder} />
          </div>
        </div>
        <div className="a-card">
          <h2>Danh sách password</h2>
          <RowsEditor
            name="passwords"
            addLabel="+ Thêm password"
            initial={r.passwords.map((p) => ({ code: p.code, effect: p.effect }))}
            columns={[
              { key: "code", label: "Password" },
              { key: "effect", label: "Hiệu ứng / phần thưởng" },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
