import { Suspense } from "react";
import { YokaiDetail, yokaiMetadata, yokaiStaticParams } from "@/components/site/YokaiDetail";

export function generateStaticParams() {
  return yokaiStaticParams(3);
}

export function generateMetadata(props: PageProps<"/yokai-watch-3/[slug]">) {
  return yokaiMetadata(3, props.params);
}

export default function Yokai3Page(props: PageProps<"/yokai-watch-3/[slug]">) {
  return (
    <div id="yokai-detail" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <YokaiDetail game={3} params={props.params} />
      </Suspense>
    </div>
  );
}
