"use client";

import { useEffect, useRef, useState } from "react";
import { uploadFile } from "@/components/admin/Fields";

type Tool = { label: string; title: string; cmd: string; value?: string; style?: React.CSSProperties };

const TOOLS: (Tool | "|")[] = [
  { label: "B", title: "In đậm", cmd: "bold", style: { fontWeight: 800 } },
  { label: "I", title: "In nghiêng", cmd: "italic", style: { fontStyle: "italic" } },
  { label: "U", title: "Gạch chân", cmd: "underline", style: { textDecoration: "underline" } },
  "|",
  { label: "Đoạn", title: "Đoạn văn", cmd: "formatBlock", value: "<p>" },
  { label: "H2", title: "Tiêu đề lớn", cmd: "formatBlock", value: "<h2>" },
  { label: "H3", title: "Tiêu đề nhỏ", cmd: "formatBlock", value: "<h3>" },
  "|",
  { label: "• Danh sách", title: "Danh sách chấm", cmd: "insertUnorderedList" },
  { label: "1. Danh sách", title: "Danh sách số", cmd: "insertOrderedList" },
  "|",
  { label: "🔗 Link", title: "Chèn liên kết (chọn chữ trước)", cmd: "@link" },
  { label: "Bỏ link", title: "Bỏ liên kết", cmd: "unlink" },
  { label: "🖼 Upload ảnh", title: "Tải ảnh lên và chèn", cmd: "@upload" },
  { label: "Ảnh URL", title: "Chèn ảnh từ URL", cmd: "@imageUrl" },
  "|",
  { label: "Xoá định dạng", title: "Xoá định dạng chữ", cmd: "removeFormat" },
  { label: "↶", title: "Hoàn tác", cmd: "undo" },
  { label: "↷", title: "Làm lại", cmd: "redo" },
];

/**
 * Trình soạn thảo trực quan (contentEditable) + tab HTML.
 * Dùng contentEditable thay vì thư viện để giữ nguyên mọi HTML/class có sẵn
 * (vd. khối icon mạng xã hội ở trang Home).
 */
export default function HtmlEditor({ name, defaultValue, contentClass }: { name: string; defaultValue: string; contentClass?: string }) {
  const [html, setHtml] = useState(defaultValue);
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
    const url = window.prompt("Nhập đường dẫn (vd: https://... hoặc /medallium):");
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
    const url = window.prompt("Nhập URL ảnh:");
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
          Soạn thảo
        </button>
        <button type="button" className={tab === "html" ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"} onClick={() => (sync(), setTab("html"))}>
          HTML
        </button>
      </div>

      {tab === "visual" ? (
        <>
          <div className="a-editor-tools">
            {TOOLS.map((t, i) =>
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
          <p className="a-hint">Soạn như Word: chọn chữ rồi bấm nút định dạng. Nhớ bấm “Lưu thay đổi” để cập nhật lên site.</p>
        </>
      ) : (
        <>
          <textarea className="a-code" rows={22} value={html} onChange={(e) => setHtml(e.target.value)} />
          <p className="a-hint">Chế độ HTML cho người rành code. Có thể dùng class của site, vd. privacy-policy-content-title.</p>
        </>
      )}
    </div>
  );
}
