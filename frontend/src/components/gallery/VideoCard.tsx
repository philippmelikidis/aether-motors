import Image from "next/image";
import { GalleryItem } from "@/data/gallery";

interface VideoCardProps {
  item: GalleryItem;
}

export default function VideoCard({ item }: VideoCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-xl bg-surface-container-low h-full">
      <Image
        src={item.image}
        alt={item.title}
        fill
        unoptimized
        className="object-cover blur-[1px] opacity-40 group-hover:opacity-60 transition-all duration-700"
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-primary text-xl">
            play_arrow
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <p className="font-headline text-sm font-semibold text-white">{item.title}</p>
        <p className="font-label text-xs text-on-surface/50">
          Video &bull; {item.duration}
        </p>
      </div>
    </div>
  );
}
