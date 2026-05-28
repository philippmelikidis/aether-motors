"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { GalleryItem } from "@/data/gallery";

interface VideoCardProps {
  item: GalleryItem;
}

/**
 * Thumbnail tile that opens a YouTube player in a full-screen modal.
 *
 * The player is mounted only after the user clicks – this keeps the gallery
 * page free of third-party trackers on first paint. We use the privacy-
 * enhanced `youtube-nocookie.com` host and request `rel=0` so YouTube doesn't
 * promote unrelated channels at the end.
 */
export default function VideoCard({ item }: VideoCardProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasEmbed = Boolean(item.youtubeId);
  const embedUrl = item.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => hasEmbed && setOpen(true)}
        disabled={!hasEmbed}
        aria-label={hasEmbed ? `Play ${item.title}` : item.title}
        className="relative group overflow-hidden rounded-xl bg-surface-container-low h-full w-full text-left cursor-pointer disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="25vw"
          className="object-cover blur-[1px] opacity-40 group-hover:opacity-60 transition-all duration-700"
          unoptimized
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-primary text-xl">
              play_arrow
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <p className="font-headline text-sm font-semibold text-white">
            {item.title}
          </p>
          <p className="font-label text-xs text-on-surface/50">
            Video &bull; {item.duration ?? ""}
          </p>
        </div>
      </button>

      {open && embedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} player`}
        >
          <div
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={embedUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl border border-white/10"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm font-headline font-semibold flex items-center gap-2"
            >
              <span className="material-symbols-outlined">close</span>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
