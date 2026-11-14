"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { ADMIN_LANG_COOKIE, ADMIN_LANGS, type AdminLang, adminLocale, makeTr } from "@/lib/admin-lang";

const LangContext = createContext<AdminLang>("vi");

export function AdminLangProvider({ lang, children }: { lang: AdminLang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Hàm dịch cho component client: const { tr } = useTr(); tr("Lưu", "Save") */
export function useTr() {
  const lang = useContext(LangContext);
  return { lang, tr: makeTr(lang), locale: adminLocale(lang) };
}

function saveLangCookie(l: AdminLang) {
  document.cookie = `${ADMIN_LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

/** Nút chọn ngôn ngữ VI / EN – lưu cookie 1 năm rồi tải lại dữ liệu trang. */
export function LangSwitch() {
  const { lang, tr } = useTr();
  const router = useRouter();
  const [pending, start] = useTransition();
  const choose = (l: AdminLang) => {
    if (l === lang) return;
    saveLangCookie(l);
    start(() => router.refresh());
  };
  return (
    <div className="a-lang" role="group" aria-label={tr("Ngôn ngữ", "Language")} aria-busy={pending}>
      {ADMIN_LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          className={l.id === lang ? "active" : undefined}
          aria-pressed={l.id === lang}
          onClick={() => choose(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
