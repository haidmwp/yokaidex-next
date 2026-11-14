import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import { getPage } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Privacy Policy") };

export default async function PrivacyPolicyPage() {
  const page = await getPage("privacy-policy");
  return (
    <div id="privacy-policy" className="content-wrapper">
      <PageHeader title={page?.title ?? "Privacy Policy"} color={page?.color ?? "#8BE4EA"} />
      <div className="privacy-policy-content">
        <div className="container">
          <div className="privacy-policy" dangerouslySetInnerHTML={{ __html: page?.content ?? "" }} />
        </div>
      </div>
    </div>
  );
}
