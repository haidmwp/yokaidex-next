import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminForm from "@/components/admin/AdminForm";
import { ColorField, TextField } from "@/components/admin/Fields";
import HtmlEditor from "../HtmlEditor";
import { savePage } from "../actions";

export default async function EditPage(props: PageProps<"/admin/pages/[id]">) {
  const { id } = await props.params;
  const page = await prisma.page.findUnique({ where: { id: Number(id) } });
  if (!page) notFound();
  const url = page.slug === "home" ? "/" : `/${page.slug}`;
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{page.title}</h1>
          <p>
            <Link href="/admin/pages">← Danh sách</Link> ·{" "}
            <a href={url} target="_blank" rel="noreferrer">
              Xem trên site ↗
            </a>
          </p>
        </div>
      </div>
      <AdminForm action={savePage.bind(null, page.id)}>
        <div className="a-card">
          <div className="a-form-grid">
            <TextField name="title" label="Tiêu đề (thanh header)" defaultValue={page.title} required />
            <ColorField name="color" defaultValue={page.color} label="Màu header" />
            <TextField name="description" label="Mô tả SEO" defaultValue={page.description} full />
          </div>
        </div>
        <div className="a-card">
          <h2>Nội dung</h2>
          <HtmlEditor name="content" defaultValue={page.content} />
        </div>
      </AdminForm>
    </>
  );
}
