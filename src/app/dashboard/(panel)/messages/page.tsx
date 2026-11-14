import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteMessage, markAllRead, toggleRead } from "./actions";
import { getTr } from "@/lib/admin-lang-server";

export default async function MessagesAdmin() {
  const { tr, locale } = await getTr();
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const unread = messages.filter((m) => !m.read).length;
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{tr("Tin nhắn liên hệ", "Contact messages")}</h1>
          <p>{tr(`${messages.length} tin nhắn · ${unread} chưa đọc`, `${messages.length} messages · ${unread} unread`)}</p>
        </div>
        {unread > 0 && (
          <form action={markAllRead}>
            <button className="a-btn">{tr("Đánh dấu đã đọc tất cả", "Mark all as read")}</button>
          </form>
        )}
      </div>
      {messages.length === 0 && <div className="a-card a-hint">{tr("Chưa có tin nhắn nào từ form Contact Us.", "No messages from the Contact Us form yet.")}</div>}
      {messages.map((m) => (
        <div key={m.id} className="a-card" style={m.read ? undefined : { borderLeft: "4px solid var(--a-primary)" }}>
          <div className="a-page-head" style={{ marginBottom: 8 }}>
            <div>
              <h2 style={{ margin: 0 }}>{m.subject}</h2>
              <p>
                <b>{m.name}</b> · <a href={`mailto:${m.email}`}>{m.email}</a> · {m.createdAt.toLocaleString(locale)}
              </p>
            </div>
            <form style={{ display: "flex", gap: 8 }}>
              <button className="a-btn a-btn-sm" formAction={toggleRead.bind(null, m.id, !m.read)}>
                {m.read ? tr("Đánh dấu chưa đọc", "Mark as unread") : tr("Đánh dấu đã đọc", "Mark as read")}
              </button>
              <DeleteButton small action={deleteMessage.bind(null, m.id)} />
            </form>
          </div>
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.message || <i className="a-hint">{tr("(không có nội dung)", "(no content)")}</i>}</p>
        </div>
      ))}
    </>
  );
}
