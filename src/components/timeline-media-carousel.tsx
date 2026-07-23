"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getVideoThumbnailUrl } from "@/lib/video-thumbnail";

type MediaItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  url: string;
};

export function TimelineMediaCarousel({
  media,
  title,
}: {
  media: MediaItem[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (media.length === 0) {
    return <div className="h-[130px] w-full bg-gradient-to-br from-[#ece7de] to-[#e0d8c8]" />;
  }

  const active = media[activeIndex];

  return (
    <>
      <div className="relative h-[130px] w-full">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={`View ${title} media`}
        >
          <Image
            src={active.type === "VIDEO" ? getVideoThumbnailUrl(active.url) : active.url}
            alt={title}
            fill
            className="object-cover"
          />
          {active.type === "VIDEO" && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/20">
              <Play className="h-8 w-8 fill-white text-white" />
            </div>
          )}
        </button>

        {media.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
                aria-label={`Show media ${index + 1}`}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          media={media}
          title={title}
          initialIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

function Lightbox({
  media,
  title,
  initialIndex,
  onClose,
}: {
  media: MediaItem[];
  title: string;
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const item = media[index];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % media.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + media.length) % media.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [media.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white"
        aria-label="Close"
      >
        <X className="h-7 w-7" />
      </button>

      {media.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i - 1 + media.length) % media.length);
          }}
          className="absolute left-4 text-white/80 hover:text-white"
          aria-label="Previous"
        >
          <ChevronLeft className="h-9 w-9" />
        </button>
      )}

      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {item.type === "VIDEO" ? (
          <video src={item.url} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded-lg" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- lightbox needs natural aspect ratio via CSS max-height/width, not next/image's fixed sizing
          <img
            src={item.url}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />
        )}
      </div>

      {media.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i + 1) % media.length);
          }}
          className="absolute right-4 text-white/80 hover:text-white"
          aria-label="Next"
        >
          <ChevronRight className="h-9 w-9" />
        </button>
      )}
    </div>
  );
}
