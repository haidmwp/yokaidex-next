"use client";

import { useState } from "react";

/** Textarea HTML + xem trước trực tiếp. */
export default function HtmlEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [html, setHtml] = useState(defaultValue);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  return (
    <div>
      <div className="a-toolbar">
        <button type="button" className={tab === "edit" ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"} onClick={() => setTab("edit")}>
          HTML
        </button>
        <button type="button" className={tab === "preview" ? "a-btn a-btn-sm a-btn-primary" : "a-btn a-btn-sm"} onClick={() => setTab("preview")}>
          Xem trước
        </button>
      </div>
      <textarea
        name={name}
        className="a-code"
        rows={22}
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        style={{ display: tab === "edit" ? "block" : "none" }}
      />
      {tab === "preview" && <div className="a-preview" dangerouslySetInnerHTML={{ __html: html }} />}
      <p className="a-hint">Hỗ trợ HTML: &lt;p&gt;, &lt;h2&gt;, &lt;a&gt;, &lt;img&gt;, &lt;ul&gt;... Có thể dùng class của site như privacy-policy-content-title.</p>
    </div>
  );
}
