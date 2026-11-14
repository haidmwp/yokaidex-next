"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/components/admin/Fields";
import { useTr } from "@/components/admin/AdminLang";
import type { Tr } from "@/lib/admin-lang";

type Tool = { label: string; title: string; cmd: string; value?: string; style?: React.CSSProperties };

const tools = (tr: Tr): (Tool | "|")[] => [
  { label: "B", title: tr("In đậm", "Bold"), cmd: "bold", style: { fontWeight: 800 } },
  { label: "I", title: tr("In nghiêng", "Italic"), cmd: "italic", style: { fontStyle: "italic" } },
  { label: "U", title: tr("Gạch chân", "Underline"), cmd: "underline", style: { textDecoration: "underline" } },
  "|",
  { label: tr("Đoạn", "Para"), title: tr("Đoạn văn", "Paragraph"), cmd: "formatBlock", value: "<p>" },
  { label: "H2", title: tr("Tiêu đề lớn", "Large heading"), cmd: "formatBlock", value: "<h2>" },
  { label: "H3", title: tr("Tiêu đề nhỏ", "Small heading"), cmd: "formatBlock", value: "<h3>" },
  "|",
  { label: tr("• Danh sách", "• List"), title: tr("Danh sách chấm", "Bulleted list"), cmd: "insertUnorderedList" },
  { label: tr("1. Danh sách", "1. List"), title: tr("Danh sách số", "Numbered list"), cmd: "insertOrderedList" },
  "|",
  { label: "🔗 Link", title: tr("Chèn liên kết (chọn chữ trước)", "Insert link (select text first)"), cmd: "@link" },
  { label: tr("Bỏ link", "Unlink"), title: tr("Bỏ liên kết", "Remove link"), cmd: "unlink" },
  { label: tr("🖼 Upload ảnh", "🖼 Upload image"), title: tr("Tải ảnh lên và chèn", "Upload and insert an image"), cmd: "@upload" },
  { label: tr("Ảnh URL", "Image URL"), title: tr("Chèn ảnh từ URL", "Insert image from URL"), cmd: "@imageUrl" },
  "|",
  { label: tr("Xoá định dạng", "Clear format"), title: tr("Xoá định dạng chữ", "Clear text formatting"), cmd: "removeFormat" },
  { label: "↶", title: tr("Hoàn tác", "Undo"), cmd: "undo" },
  { label: "↷", title: tr("Làm lại", "Redo"), cmd: "redo" },
];

/**
 * Trình soạn thảo trực quan (contentEditable) + tab HTML.
 * Dùng contentEditable thay vì thư viện để giữ nguyên mọi HTML/class có sẵn
 * (vd. khối icon mạng xã hội ở trang Home).
 */
export default function HtmlEditor({ name, defaultValue, contentClass }: { name: string; defaultValue: string; contentClass?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const { tr } = useTr();
  const [tab, setTab] = useState<"visual" | "html">("visual");
  const [busy, setBusy] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);

  // Nạp HTML vào vùng soạn thảo khi mở tab trực quan (không ghi đè mỗi lần gõ để giữ con trỏ)
  useEffect(() => {
    if (tab === "visual" && editor.current && editor.current.innerHTML !== html) editor.current.innerHTML = html;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  const sync = () => editor.current && setHtml(editor.current.innerHTML);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editor.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0);
  };
  const restoreSelection = () => {
    editor.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, value?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, value);
    sync();
    saveSelection();
  };

  const addLink = () => {
    saveSelection();
    const url = window.prompt(tr("Nhập đường dẫn (vd: https://... hoặc /medallium):", "Enter a URL (e.g. https://... or /medallium):"));
    if (!url) return;
    exec("createLink", url);
    // link ra ngoài mở tab mới
    if (/^https?:\/\//.test(url) && editor.current) {
      editor.current.querySelectorAll(`a[href="${CSS.escape(url)}"]`).forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noreferrer");
      });
      sync();
    }
  };

  const addImageUrl = () => {
    saveSelection();
    const url = window.prompt(tr("Nhập URL ảnh:", "Enter image URL:"));
    if (url) exec("insertImage", url);
  };

  const handle = (t: Tool) => {
    if (t.cmd === "@link") return addLink();
    if (t.cmd === "@imageUrl") return addImageUrl();
    if (t.cmd === "@upload") {
      saveSelection();
      fileRef.current?.click();
      return;
    }
    exec(t.cmd, t.value);
  };

  return (
    <div className="a-editor">
      <input type="hidden" name={name} value={html} />
      <div className="a-toolbar" style={{ marginBottom: 8 }}>
        <button type="button" className={tab === "visual" ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"} onClick={() => setTab("visual")}>
          {tr("Soạn thảo", "Visual")}
        </button>
        <button type="button" className={tab === "html" ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"} onClick={() => (sync(), setTab("html"))}>
          HTML
        </button>
      </div>

      {tab === "visual" ? (
        <>
          <div className="a-editor-tools">
            {tools(tr).map((t, i) =>
              t === "|" ? (
                <span key={i} className="a-editor-sep" />
              ) : (
                <button
                  key={i}
                  type="button"
                  className="a-btn a-btn-sm"
                  title={t.title}
                  style={t.style}
                  disabled={busy}
                  onMouseDown={(e) => e.preventDefault() /* giữ vùng chọn */}
                  onClick={() => handle(t)}
                >
                  {t.label}
                </button>
              ),
            )}
          </div>
          <div
            ref={editor}
            className={`a-wysiwyg ${contentClass ?? ""}`}
            contentEditable
            suppressContentEditableWarning
            onInput={sync}
            onBlur={() => (saveSelection(), sync())}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true);
              try {
                exec("insertImage", await uploadFile(f));
              } catch (err) {
                alert((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
          <p className="a-hint">
            {tr(
              "Soạn như Word: chọn chữ rồi bấm nút định dạng. Nhớ bấm “Lưu thay đổi” để cập nhật lên site.",
              "Edit like Word: select text, then click a format button. Remember to click “Save” to update the site.",
            )}
          </p>
        </>
      ) : (
        <>
          <textarea className="a-code" rows={22} value={html} onChange={(e) => setHtml(e.target.value)} />
          <p className="a-hint">
            {tr(
              "Chế độ HTML cho người rành code. Có thể dùng class của site, vd. privacy-policy-content-title.",
              "HTML mode for people comfortable with code. You can use site classes, e.g. privacy-policy-content-title.",
            )}
          </p>
        </>
      )}
    </div>
  );
}
