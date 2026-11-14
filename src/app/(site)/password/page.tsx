import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import { PASSWORD_GAMES, pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Password") };

export default function PasswordPage() {
  return (
    <div id="password" className="content-wrapper">
      <PageHeader title="Password" color="#FF8041" />
      <div className="password-content">
        <div className="container">
          <div className="password-wrapper">
            {PASSWORD_GAMES.map((g) => (
              <div key={g.game} className="password">
                <Link href={`/password-${g.game}`}>
                  <img alt={`Yo-kai Watch ${g.game}`} width="416" height="200" className="img-password-logo" src={g.logo} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
