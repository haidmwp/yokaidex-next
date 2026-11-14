"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Mousewheel, Pagination } from "swiper/modules";
import "swiper/css";

export default function QrSlider({ slides }: { slides: string[] }) {
  return (
    <Swiper
      keyboard={{ enabled: true }}
      mousewheel={{ enabled: true }}
      modules={[Keyboard, Mousewheel, Pagination]}
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
