import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import { ColorField, TextField } from "@/components/admin/Fields";
import RowsEditor from "@/components/admin/RowsEditor";
import type { Socials } from "@/lib/types";
import HtmlEditor from "../HtmlEditor";
import { savePage, saveSocials } from "../actions";
import { getTr } from "@/lib/admin-lang-server";

export default async function EditPage(props: PageProps<"/dashboard/pages/[id]">) {
  const { id } = await props.params;
  const { tr } = await getTr();
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
            <Link href="/dashboard/pages">{tr("← Danh sách", "← Back to list")}</Link> ·{" "}
            <a href={url} target="_blank" rel="noreferrer">
              {tr("Xem trên site ↗", "View on site ↗")}
            </a>
            {socials && (
              <>
                {" · "}
                <a href="#follow-us">{tr("Sửa Follow us ↓", "Edit Follow us ↓")}</a>
              </>
            )}
          </p>
        </div>
      </div>

      <AdminForm action={savePage.bind(null, page.id)} submitLabel={tr("Lưu nội dung trang", "Save page content")}>
        <div className="a-card">
          <div className="a-form-grid">
            <TextField name="title" label={tr("Tiêu đề (thanh header)", "Title (header bar)")} defaultValue={page.title} required />
            <ColorField name="color" defaultValue={page.color} label={tr("Màu header", "Header color")} />
            <TextField name="description" label={tr("Mô tả SEO", "SEO description")} defaultValue={page.description} full />
          </div>
        </div>
        <div className="a-card">
          <h2>{tr("Nội dung", "Content")}</h2>
          <HtmlEditor name="content" defaultValue={page.content} contentClass={isHome ? "home" : "privacy-policy"} />
        </div>
      </AdminForm>

      {socials && (
        <div id="follow-us" style={{ marginTop: 28, scrollMarginTop: 70 }}>
          <AdminForm action={saveSocials} submitLabel={tr("Lưu Follow us", "Save Follow us")}>
            <div className="a-card">
              <h2>{tr("Follow us (mạng xã hội)", "Follow us (social networks)")}</h2>
              <p className="a-hint" style={{ marginTop: -6 }}>
                {tr(
                  "Khối icon hiển thị dưới nội dung trang chủ. Lưu riêng, không ảnh hưởng nội dung phía trên.",
                  "Icon block shown below the home page content. Saved separately; does not affect the content above.",
                )}
              </p>
              <div className="a-form-grid" style={{ marginBottom: 14 }}>
                <TextField name="title" label={tr("Tiêu đề khối", "Block title")} defaultValue={socials.title} />
              </div>
              <RowsEditor
                name="links"
                addLabel={tr("+ Thêm mạng xã hội", "+ Add social network")}
                initial={socials.links}
                columns={[
                  { key: "name", label: tr("Tên", "Name"), width: 150, placeholder: "Facebook" },
                  { key: "url", label: tr("Đường dẫn", "URL"), placeholder: "https://..." },
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
