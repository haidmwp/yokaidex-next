import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";

export default function NotFound() {
  return (
    <div id="not-found" className="content-wrapper">
      <PageHeader title="Page not found!" color="#E85A3D" />
      <div className="not-found-content">
        <div className="container">
          <div className="not-found">
            <img alt="not found" className="img-not-found" src="/img/ui/img-not-found.webp" />
            <p>Oops! It looks like this link is broken.</p>
            <Link href="/">Click here to return to the home page!</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
