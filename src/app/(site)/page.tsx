import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { getPage, getSocials } from "@/lib/data";
import { SITE_DESCRIPTION } from "@/lib/constants";

// tiêu đề = "Tiêu đề website" mặc định từ layout (Cài đặt chung)
export const metadata: Metadata = { description: SITE_DESCRIPTION };

export default async function HomePage() {
  const [page, socials] = await Promise.all([getPage("home"), getSocials()]);
  return (
    <div id="home" className="home-content-wrapper content-wrapper">
      <PageHeader title={page?.title ?? "Home"} color={page?.color ?? "#758EFF"} home />
      <div className="home-content">
        <div className="container">
          <div className="home">
            <div dangerouslySetInnerHTML={{ __html: page?.content ?? "" }} />
            {socials.links.length > 0 && (
              <div className="follow-wrapper">
                <p className="follow-title">{socials.title}</p>
                <ul className="socials-wrapper">
                  {socials.links.map((s) => (
                    <li key={s.url + s.name}>
                      <a rel="noreferrer" target="_blank" href={s.url}>
                        <img title={s.name} alt={s.name} width="35" height="35" className="icon-follow" src={s.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
