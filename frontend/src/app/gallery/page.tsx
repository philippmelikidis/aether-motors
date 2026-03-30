import Image from "next/image";
import { galleryItems } from "@/data/gallery";
import GalleryHero from "@/components/gallery/GalleryHero";
import MediaGrid from "@/components/gallery/MediaGrid";

export const metadata = {
  title: "Gallery | Aether Motors",
  description: "Explore the Aether Motors visual archive",
};

export default function GalleryPage() {
  const heroItem = galleryItems.find((item) => item.title.includes("Manifesto"))!;
  const fleetItem = galleryItems.find((item) => item.id === "the-fleet-evolution")!;
  const gridItems = galleryItems.filter(
    (item) => item.id !== heroItem.id && item.id !== fleetItem.id
  );

  return (
    <main className="pt-24 pb-12 px-8 max-w-[1920px] mx-auto">
      {/* Hero */}
      <GalleryHero item={heroItem} />

      {/* Media Grid */}
      <MediaGrid items={gridItems} />

      {/* Fleet Evolution Banner */}
      <div className="mt-8 group relative overflow-hidden rounded-xl bg-surface-container-low h-48">
        <Image
          src={fleetItem.image}
          alt={fleetItem.title}
          fill
          unoptimized
          className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-surface-dim/80 to-transparent z-10" />
        <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-12">
          <h2 className="font-headline text-3xl font-bold text-white mb-2">
            The Fleet Evolution
          </h2>
          <p className="font-body text-sm text-on-surface/60 max-w-md mb-4">
            From concept sketches to production-ready hypercar. Trace the lineage of
            every Aether model.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 font-headline text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Explore All Models
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </a>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-8 py-8 text-center border-t border-white/5">
        <div className="w-12 h-0.5 bg-primary mx-auto mb-6" />
        <h2 className="font-headline text-4xl font-black tracking-tighter text-white mb-3">
          OWN THE HORIZON.
        </h2>
        <p className="font-body text-on-surface/50 text-sm max-w-lg mx-auto mb-8">
          Cloud-native engineering meets uncompromising design. Configure your Aether
          and join the next era of driving.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/configurator"
            className="px-8 py-3 rounded-md bg-white text-surface-dim font-headline font-semibold text-sm hover:bg-primary transition-colors"
          >
            Build Yours
          </a>
          <a
            href="#"
            className="px-8 py-3 rounded-md border border-white/15 text-white font-headline font-semibold text-sm hover:border-white/30 transition-colors"
          >
            Request Catalog
          </a>
        </div>
      </div>
    </main>
  );
}
