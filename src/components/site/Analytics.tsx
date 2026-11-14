import Script from "next/script";
import { Suspense } from "react";
import { getGeneralSettings } from "@/lib/settings";
import GaPageView from "./GaPageView";

/** Google Analytics 4 – mã lấy từ Admin › Cài đặt chung (rỗng = tắt). */
export default async function Analytics() {
  const { gaId } = await getGeneralSettings();
  if (!gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      {/* send_page_view: false – page_view do GaPageView gửi, kể cả khi chuyển trang phía client */}
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`}
      </Script>
      <Suspense fallback={null}>
        <GaPageView id={gaId} />
      </Suspense>
    </>
  );
}
