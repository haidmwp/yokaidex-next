import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { getPage } from "@/lib/data";
import { SITE_DESCRIPTION, pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle(), description: SITE_DESCRIPTION };

export default async function HomePage() {
  const page = await getPage("home");
  return (
    <div id="home" className="home-content-wrapper content-wrapper">
      <PageHeader title={page?.title ?? "Home"} color={page?.color ?? "#758EFF"} home />
      <div className="home-content">
        <div className="container">
          <div className="home" dangerouslySetInnerHTML={{ __html: page?.content ?? "" }} />
        </div>
      </div>
    </div>
  );
}
