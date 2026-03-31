import Image from "next/image";
import { GalleryItem } from "@/data/gallery";

interface GalleryHeroProps {
  item: GalleryItem;
}

export default function GalleryHero({ item }: GalleryHeroProps) {
  const titleParts = item.title.split(" ");
  const firstLine = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(" ");
  const secondLine = titleParts.slice(Math.ceil(titleParts.length / 2)).join(" ");

  return (
    <div className="relative w-full h-[480px] mb-8 rounded-xl overflow-hidden group">
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="100vw"
        className="object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-1000"
        unoptimized
      />

      <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent z-10" />

      <div className="absolute bottom-8 left-12 z-20">
        <p className="font-headline text-primary font-bold tracking-[0.2em] uppercase text-xs mb-2">
          Now Premiering
        </p>
        <h1 className="font-headline text-6xl font-black tracking-tighter text-white leading-none mb-4">
          {firstLine}
          <br />
          <span className="text-primary text-glow">{secondLine}</span>
        </h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container px-6 py-2.5 rounded-md font-headline font-semibold text-on-primary-container text-sm transition-opacity hover:opacity-90">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
            Watch Film
          </button>
          <button className="glass-panel flex items-center gap-2 border border-white/10 px-6 py-2.5 rounded-md font-headline font-semibold text-white text-sm transition-colors hover:border-white/25">
            Technical Specs
          </button>
        </div>
      </div>
    </div>
  );
}
