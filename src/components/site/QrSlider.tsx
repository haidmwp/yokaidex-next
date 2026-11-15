"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel, Pagination } from "swiper/modules";
import "swiper/css";

/** storageKey: nhớ slide đang xem của từng bộ QR (localStorage) – mở lại trang/trình duyệt vẫn quay về đúng slide. */
export default function QrSlider({ slides, storageKey }: { slides: string[]; storageKey?: string }) {
  return (
    <Swiper
      keyboard={{ enabled: true }}
      mousewheel={{ enabled: true }}
      modules={[Keyboard, Mousewheel, Pagination]}
      onSwiper={(swiper) => {
        if (!storageKey) return;
        try {
          const saved = Number(localStorage.getItem(storageKey));
          if (Number.isInteger(saved) && saved > 0 && saved < slides.length) swiper.slideTo(saved, 0);
        } catch {}
      }}
      onSlideChange={(swiper) => {
        if (!storageKey) return;
        try {
          if (swiper.activeIndex > 0) localStorage.setItem(storageKey, String(swiper.activeIndex));
          else localStorage.removeItem(storageKey);
        } catch {}
      }}
      pagination={{
        clickable: true,
        type: "bullets",
        bulletElement: "span",
        bulletClass: "slide-number",
        bulletActiveClass: "slide-number-active",
        renderBullet: (index, className) => `<span class="${className}">${index + 1}</span>`,
      }}
    >
      {slides.map((src, i) => (
        <SwiperSlide key={i}>
          <img alt="qr code" className="img-qr-slide" src={src} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
