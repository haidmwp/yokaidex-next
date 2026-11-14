import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { ColorField, SelectField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import { PASSWORD_GAMES } from "@/lib/constants";
import { deleteRegion, saveRegion } from "../actions";
import { getTr } from "@/lib/admin-lang-server";

export default async function EditRegion(props: PageProps<"/dashboard/passwords/[id]">) {
  const { id } = await props.params;
  const { tr } = await getTr();
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
          <h1>{isNew ? tr("Thêm vùng password", "Add password region") : `Yo-kai Watch ${r.game} · ${r.label}`}</h1>
          <p>
            <Link href="/dashboard/passwords">{tr("← Danh sách", "← Back to list")}</Link>
            {!isNew && (
              <>
                {" · "}
                <a href={`/password-${r.game}/${r.code}`} target="_blank" rel="noreferrer">
                  {tr("Xem trên site ↗", "View on site ↗")}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
      <AdminForm
        action={saveRegion.bind(null, isNew ? null : r.id)}
        extraActions={!isNew && <DeleteButton action={deleteRegion.bind(null, r.id)} label={tr("Xoá vùng", "Delete region")} />}
      >
        <div className="a-card">
          <div className="a-form-grid">
            <SelectField
              name="game"
              label="Game"
              defaultValue={String(r.game)}
              options={PASSWORD_GAMES.map((g) => ({ value: String(g.game), label: `Yo-kai Watch ${g.game}` }))}
            />
            <TextField name="code" label={tr("Mã vùng (URL)", "Region code (URL)")} defaultValue={r.code} required hint={tr("vd: en-us", "e.g. en-us")} />
            <TextField name="label" label={tr("Nhãn hiển thị", "Display label")} defaultValue={r.label} required hint={tr("vd: EN (US)", "e.g. EN (US)")} />
            <ColorField name="color" defaultValue={r.color} />
            <TextField name="sortOrder" label={tr("Thứ tự", "Order")} type="number" defaultValue={r.sortOrder} />
          </div>
        </div>
        <div className="a-card">
          <h2>{tr("Danh sách password", "Passwords")}</h2>
          <RowsEditor
            name="passwords"
            addLabel={tr("+ Thêm password", "+ Add password")}
            initial={r.passwords.map((p) => ({ code: p.code, effect: p.effect }))}
            columns={[
              { key: "code", label: "Password" },
              { key: "effect", label: tr("Hiệu ứng / phần thưởng", "Effect / reward") },
            ]}
          />
        </div>
      </AdminForm>
    </>
  );
}
