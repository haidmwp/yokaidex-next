"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Keyboard, Mousewheel, Pagination } from "swiper/modules";
import "swiper/css";
import { useQrScanned } from "@/lib/local-store";

/**
 * Slider QR của một bộ:
 * - storageKey: nhớ slide đang xem (mở lại vẫn về đúng slide)
 * - setKey: "<coin>/<bộ>" – đánh dấu từng mã đã quét (lưu trên trình duyệt), số trang đã quét có dấu ✓
 * - bấm ảnh / nút phóng to: xem QR toàn màn hình nền trắng để quét dễ hơn
 */
export default function QrSlider({ slides, storageKey, setKey }: { slides: string[]; storageKey?: string; setKey?: string }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [scannedMap, updateScanned] = useQrScanned();
  const scanned = useMemo(() => (setKey && scannedMap[setKey]) || [], [scannedMap, setKey]);
  const isScanned = (i: number) => scanned.includes(i);

  const toggleScanned = useCallback(
    (i: number) => {
      if (!setKey) return;
      updateScanned((prev) => {
        const list = prev[setKey] ?? [];
        const next = list.includes(i) ? list.filter((x) => x !== i) : [...list, i].sort((a, b) => a - b);
        const copy = { ...prev };
        if (next.length) copy[setKey] = next;
        else delete copy[setKey];
        return copy;
      });
    },
    [setKey, updateScanned],
  );

  // đánh dấu số trang đã quét (bullet do Swiper tạo bằng HTML nên gắn class trực tiếp)
  const paintBullets = useCallback(() => {
    const bullets = swiperRef.current?.pagination?.bullets;
    if (!bullets) return;
    Array.from(bullets as ArrayLike<HTMLElement>).forEach((b, i) => b.classList.toggle("slide-number-scanned", scanned.includes(i)));
  }, [scanned]);
  useEffect(paintBullets, [paintBullets]);

  const go = useCallback((i: number) => swiperRef.current?.slideTo(Math.max(0, Math.min(slides.length - 1, i))), [slides.length]);

  // chế độ phóng to: tắt phím/cuộn của Swiper, dùng phím riêng, khoá cuộn trang
  useEffect(() => {
    if (!zoom) return;
    const sw = swiperRef.current;
    sw?.keyboard?.disable();
    sw?.mousewheel?.disable();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") go((swiperRef.current?.activeIndex ?? 0) + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go((swiperRef.current?.activeIndex ?? 0) - 1);
      else if (e.key === " ") {
        e.preventDefault();
        toggleScanned(swiperRef.current?.activeIndex ?? 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      sw?.keyboard?.enable();
      sw?.mousewheel?.enable();
    };
  }, [zoom, go, toggleScanned]);

  const total = slides.length;
  const done = scanned.filter((i) => i < total).length;

  return (
    <>
      {setKey && (
        <div className="qr-tools">
          <span className={done === total && total > 0 ? "qr-progress qr-progress-done" : "qr-progress"}>
            {done}/{total} scanned
          </span>
          <button
            type="button"
            className={isScanned(active) ? "qr-tool-btn qr-tool-on" : "qr-tool-btn"}
            onClick={() => toggleScanned(active)}
            aria-pressed={isScanned(active)}
          >
            {isScanned(active) ? "✓ Scanned" : "Mark as scanned"}
          </button>
          <button type="button" className="qr-tool-btn" onClick={() => setZoom(true)} title="Full screen">
            ⛶ Zoom
          </button>
        </div>
      )}

      <Swiper
        keyboard={{ enabled: true }}
        mousewheel={{ enabled: true }}
        modules={[Keyboard, Mousewheel, Pagination]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (storageKey) {
            try {
              const saved = Number(localStorage.getItem(storageKey));
              if (Number.isInteger(saved) && saved > 0 && saved < slides.length) swiper.slideTo(saved, 0);
            } catch {}
          }
          setActive(swiper.activeIndex);
        }}
        onPaginationRender={paintBullets}
        onSlideChange={(swiper) => {
          setActive(swiper.activeIndex);
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
            <img alt="qr code" className="img-qr-slide" src={src} onClick={() => setZoom(true)} />
            {isScanned(i) && <span className="qr-scanned-badge">✓</span>}
          </SwiperSlide>
        ))}
      </Swiper>

      {zoom && (
        <div className="qr-zoom" role="dialog" aria-modal="true" aria-label="QR code full screen" onClick={() => setZoom(false)}>
          <div className="qr-zoom-bar" onClick={(e) => e.stopPropagation()}>
            <span className="qr-zoom-count">
              {active + 1} / {total}
            </span>
            {setKey && (
              <button
                type="button"
                className={isScanned(active) ? "qr-tool-btn qr-tool-on" : "qr-tool-btn"}
                onClick={() => toggleScanned(active)}
                aria-pressed={isScanned(active)}
              >
                {isScanned(active) ? "✓ Scanned" : "Mark as scanned"}
              </button>
            )}
            <button type="button" className="qr-zoom-close" onClick={() => setZoom(false)} aria-label="Close">
              ×
            </button>
          </div>
          <img className="qr-zoom-img" src={slides[active]} alt={`QR code ${active + 1}`} onClick={(e) => e.stopPropagation()} />
          {active > 0 && (
            <button
              type="button"
              className="qr-zoom-nav qr-zoom-prev"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                go(active - 1);
              }}
            >
              ‹
            </button>
          )}
          {active < total - 1 && (
            <button
              type="button"
              className="qr-zoom-nav qr-zoom-next"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                go(active + 1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
