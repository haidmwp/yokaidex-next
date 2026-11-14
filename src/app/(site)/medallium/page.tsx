import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import { YOKAI_GAMES, pageTitle, yokaiListHref } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Medallium") };

// Chọn game giống trang Password
export default function MedalliumPage() {
  return (
    <div id="password" className="content-wrapper">
      <PageHeader title="Medallium" color="#E85A3D" />
      <div className="password-content">
        <div className="container">
          <div className="password-wrapper">
            {YOKAI_GAMES.map((g) => (
              <div key={g.game} className="password">
                <Link href={yokaiListHref(g.game)}>
                  <img alt={g.title} width="416" height="200" className="img-password-logo" src={g.logo} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
