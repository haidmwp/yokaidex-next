"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action}>
      {state.error && <div className="a-alert a-alert-err">{state.error}</div>}
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="a-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" required autoFocus autoComplete="username" />
      </div>
      <div className="a-field">
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" name="password" required autoComplete="current-password" />
      </div>
      <button className="a-btn a-btn-primary" disabled={pending}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
