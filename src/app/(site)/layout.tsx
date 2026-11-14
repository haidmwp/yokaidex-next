import "@/styles/site.css";
import SiteShell from "@/components/site/SiteShell";
import Analytics from "@/components/site/Analytics";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <Analytics />
    </>
  );
}
