import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLangProvider, LangSwitch } from "@/components/admin/AdminLang";
import { getTr } from "@/lib/admin-lang-server";
import ThemeToggle from "@/components/ThemeToggle";
import { THEME_KEYS } from "@/components/ThemeScript";
import LoginForm from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTr();
  return { title: tr("Đăng nhập", "Log in") };
}

async function Form({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, { lang, tr }] = await Promise.all([searchParams, getTr()]);
  return (
    <AdminLangProvider lang={lang}>
      <div className="a-login-lang">
        <ThemeToggle className="a-theme-btn" storageKey={THEME_KEYS.admin} labels={{ light: tr("Chế độ sáng", "Light mode"), dark: tr("Chế độ tối", "Dark mode") }} />
        <LangSwitch />
      </div>
      <LoginForm next={next} />
    </AdminLangProvider>
  );
}

export default function LoginPage(props: PageProps<"/dashboard/login">) {
  return (
    <div className="a-login">
      <div className="a-card">
        <div className="a-login-logo">
          <img src="/img/ui/icon-logo.webp" alt="" /> YokaiDex Admin
        </div>
        <Suspense fallback={null}>
          <Form searchParams={props.searchParams as Promise<{ next?: string }>} />
        </Suspense>
      </div>
    </div>
  );
}
