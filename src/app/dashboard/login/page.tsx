import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Đăng nhập" };

async function Form({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={next} />;
}

export default function LoginPage(props: PageProps<"/dashboard/login">) {
  return (
    <div className="a-login">
      <div className="a-card">
        <div className="a-login-logo">
          <img src="/img/ui/icon-logo.webp" alt="" /> YokaiDex Admin
        </div>
        <Suspense fallback={<LoginForm />}>
          <Form searchParams={props.searchParams as Promise<{ next?: string }>} />
        </Suspense>
      </div>
    </div>
  );
}
