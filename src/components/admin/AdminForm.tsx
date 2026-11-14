"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/admin";

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  extraActions?: React.ReactNode;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="a-btn a-btn-primary" disabled={pending}>
      {pending ? "Đang lưu..." : label}
    </button>
  );
}

/** Form admin chuẩn: gửi server action, hiện thông báo thành công/lỗi, thanh lưu cố định. */
export default function AdminForm({ action, children, submitLabel = "Lưu thay đổi", extraActions }: Props) {
  const [state, formAction] = useActionState(action, {});
  // thông báo thành công tự ẩn sau 4 giây
  const [dismissed, setDismissed] = useState<ActionState | null>(null);
  const shown: ActionState = dismissed === state ? {} : state;

  useEffect(() => {
    if (!state.ok) return;
    const t = setTimeout(() => setDismissed(state), 4000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <form action={formAction}>
      {shown.ok && <div className="a-alert a-alert-ok">✓ {shown.ok}</div>}
      {shown.error && <div className="a-alert a-alert-err">{shown.error}</div>}
      {children}
      <div className="a-actions-bar">
        <Submit label={submitLabel} />
        {extraActions}
      </div>
    </form>
  );
}
