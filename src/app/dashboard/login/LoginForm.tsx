"use client";

import { useActionState } from "react";
import { useTr } from "@/components/admin/AdminLang";
import { login, type LoginState } from "../actions";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const { tr } = useTr();
  return (
    <form action={action}>
      {state.error && <div className="a-alert a-alert-err">{state.error}</div>}
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="a-field">
        <label htmlFor="identifier">{tr("Username hoặc email", "Username or email")}</label>
        <input id="identifier" type="text" name="identifier" required autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </div>
      <div className="a-field">
        <label htmlFor="password">{tr("Mật khẩu", "Password")}</label>
        <input id="password" type="password" name="password" required autoComplete="current-password" />
      </div>
      <button className="a-btn a-btn-primary" disabled={pending}>
        {pending ? tr("Đang đăng nhập...", "Logging in...") : tr("Đăng nhập", "Log in")}
      </button>
    </form>
  );
}
