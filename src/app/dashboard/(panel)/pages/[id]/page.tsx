import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import { ColorField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import type { Socials } from "@/lib/types";
import HtmlEditor from "../HtmlEditor";
import { savePage, saveSocials } from "../actions";

export default async function EditPage(props: PageProps<"/dashboard/pages/[id]">) {
  const { id } = await props.params;
  const page = /^\d+$/.test(id)
    ? await prisma.page.findUnique({ where: { id: Number(id) } })
    : await prisma.page.findUnique({ where: { slug: id } });
  if (!page) notFound();
  const isHome = page.slug === "home";
  const url = isHome ? "/" : `/${page.slug}`;
  const socials = isHome
    ? (((await prisma.setting.findUnique({ where: { key: "socials" } }))?.value ?? { title: "Follow us on:", links: [] }) as Socials)
    : null;

  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{page.title}</h1>
          <p>
            <Link href="/dashboard/pages">← Danh sách</Link> ·{" "}
            <a href={url} target="_blank" rel="noreferrer">
              Xem trên site ↗
            </a>
            {socials && (
              <>
                {" · "}
                <a href="#follow-us">Sửa Follow us ↓</a>
              </>
            )}
          </p>
        </div>
      </div>

      <AdminForm action={savePage.bind(null, page.id)} submitLabel="Lưu nội dung trang">
        <div className="a-card">
          <div className="a-form-grid">
            <TextField name="title" label="Tiêu đề (thanh header)" defaultValue={page.title} required />
            <ColorField name="color" defaultValue={page.color} label="Màu header" />
            <TextField name="description" label="Mô tả SEO" defaultValue={page.description} full />
          </div>
        </div>
        <div className="a-card">
          <h2>Nội dung</h2>
          <HtmlEditor name="content" defaultValue={page.content} contentClass={isHome ? "home" : "privacy-policy"} />
        </div>
      </AdminForm>

      {socials && (
        <div id="follow-us" style={{ marginTop: 28, scrollMarginTop: 70 }}>
          <AdminForm action={saveSocials} submitLabel="Lưu Follow us">
            <div className="a-card">
              <h2>Follow us (mạng xã hội)</h2>
              <p className="a-hint" style={{ marginTop: -6 }}>
                Khối icon hiển thị dưới nội dung trang chủ. Lưu riêng, không ảnh hưởng nội dung phía trên.
              </p>
              <div className="a-form-grid" style={{ marginBottom: 14 }}>
                <TextField name="title" label="Tiêu đề khối" defaultValue={socials.title} />
              </div>
              <RowsEditor
                name="links"
                addLabel="+ Thêm mạng xã hội"
                initial={socials.links}
                columns={[
                  { key: "name", label: "Tên", width: 150, placeholder: "Facebook" },
                  { key: "url", label: "Đường dẫn", placeholder: "https://..." },
                  { key: "icon", label: "Icon", type: "image" },
                ]}
              />
            </div>
          </AdminForm>
        </div>
      )}
    </>
  );
}
