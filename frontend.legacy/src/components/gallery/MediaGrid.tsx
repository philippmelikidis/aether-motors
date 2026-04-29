import Image from "next/image";
import { GalleryItem } from "@/data/gallery";
import VideoCard from "./VideoCard";

interface MediaGridProps {
  items: GalleryItem[];
}

export default function MediaGrid({ items }: MediaGridProps) {
  const largeItem = items.find((i) => i.span === "large");
  const mediumItem = items.find((i) => i.span === "medium" && i.type === "image");
  const videoItem = items.find((i) => i.type === "video");
  const smallItem = items.find((i) => i.span === "small");

  return (
    <div className="grid grid-cols-12 gap-6 h-[460px]">
      {/* Large feature — col-span-6 */}
      {largeItem && (
        <div className="col-span-6 group relative overflow-hidden rounded-xl bg-surface-container-low">
          <Image
            src={largeItem.image}
            alt={largeItem.title}
            fill
            sizes="50vw"
            className="object-cover group-hover:scale-105 group-hover:grayscale-0 grayscale transition-all duration-700"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
            <p className="font-headline text-lg font-bold text-white">{largeItem.title}</p>
            {largeItem.subtitle && (
              <p className="font-label text-sm text-on-surface/60">{largeItem.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Medium vertical — col-span-3 */}
      {mediumItem && (
        <div className="col-span-3 group relative overflow-hidden rounded-xl bg-surface-container-low">
          <Image
            src={mediumItem.image}
            alt={mediumItem.title}
            fill
            sizes="25vw"
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 glass-panel border-t border-white/10 backdrop-blur-sm">
            <p className="font-headline text-sm font-semibold text-white">{mediumItem.title}</p>
            {mediumItem.subtitle && (
              <p className="font-label text-xs text-on-surface/50">{mediumItem.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Right column — col-span-3, two rows */}
      <div className="col-span-3 grid grid-rows-2 gap-6">
        {/* Video item on top */}
        {videoItem && <VideoCard item={videoItem} />}

        {/* Small image on bottom */}
        {smallItem && (
          <div className="group relative overflow-hidden rounded-xl bg-surface-container-low">
            <Image
              src={smallItem.image}
              alt={smallItem.title}
              fill
              sizes="25vw"
              className="object-cover group-hover:scale-105 group-hover:grayscale-0 grayscale transition-all duration-700"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
              <p className="font-headline text-sm font-semibold text-white">{smallItem.title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
