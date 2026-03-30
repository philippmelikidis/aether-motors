import Image from "next/image";
import Link from "next/link";
import { defaultVehicle } from "@/data/vehicles";

/* ── Landing / Home Page ──
   Backend integration points:
   - Vehicle showcase data → product-service
   - Featured content → media-service
*/

const navCards = [
  {
    title: "Configurator",
    description: "Design your dream machine from the ground up.",
    icon: "tune",
    href: "/configurator",
  },
  {
    title: "Merchandise",
    description: "Premium apparel and collectibles.",
    icon: "storefront",
    href: "/merchandise",
  },
  {
    title: "Gallery",
    description: "Cinematic visuals and engineering films.",
    icon: "photo_library",
    href: "/gallery",
  },
  {
    title: "Roadmap",
    description: "Track the journey to the global premiere.",
    icon: "map",
    href: "/roadmap",
  },
];

export default function HomePage() {
  const vehicle = defaultVehicle;

  return (
    <main>
      {/* ── Hero Section ── */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background vehicle image */}
        <Image
          src={vehicle.image}
          alt={vehicle.name}
          fill
          className="object-cover opacity-70"
          priority
          unoptimized
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-dim/60 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-32 max-w-[1920px] mx-auto">
          <p className="font-label text-primary text-xs tracking-[0.3em] uppercase font-bold mb-4">
            The Future of Automotive Performance
          </p>
          <h1 className="font-headline text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.9] mb-6">
            AETHER
            <br />
            <span className="text-primary text-glow">MOTORS</span>
          </h1>
          <p className="font-body text-secondary text-lg max-w-xl mb-10">
            Cloud-native engineering meets uncompromising design. Experience the
            pinnacle of electric performance — engineered for those who demand
            the extraordinary.
          </p>

          <div className="flex gap-4">
            <Link
              href="/configurator"
              className="btn-primary px-10 py-4 primary-glow inline-flex items-center gap-2"
            >
              <span>Build Yours</span>
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/gallery"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                play_arrow
              </span>
              <span>Watch Film</span>
            </Link>
          </div>
        </div>

        {/* Floating vehicle specs */}
        <div className="absolute bottom-12 right-12 z-10 hidden lg:flex gap-12 items-end">
          {vehicle.specs.map((spec) => (
            <div key={spec.label}>
              <span className="block text-[10px] font-label uppercase tracking-widest text-secondary/40 mb-1">
                {spec.label}
              </span>
              <span className="text-4xl font-headline font-bold text-white tracking-tighter">
                {spec.value}
                <span className="text-primary text-xl">{spec.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Navigation Cards Section ── */}
      <section className="px-8 py-24 max-w-[1920px] mx-auto">
        <div className="text-center mb-16">
          <p className="font-label text-primary text-xs tracking-[0.2em] uppercase font-bold mb-3">
            Explore
          </p>
          <h2 className="font-headline text-5xl font-bold tracking-tighter text-white">
            THE ECOSYSTEM
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {navCards.map((card) => (
            <Link key={card.href} href={card.href} className="group">
              <div className="glass-panel rounded-xl p-8 h-full transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,218,248,0.1)] hover:border-primary/20">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-white uppercase tracking-tight mb-3">
                  {card.title}
                </h3>
                <p className="text-secondary text-sm font-body">
                  {card.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-primary font-label text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  <span>Explore</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Vehicle Showcase ── */}
      <section className="px-8 pb-24 max-w-[1920px] mx-auto">
        <div className="relative h-96 rounded-xl overflow-hidden group">
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2000ms]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-dim via-surface-dim/60 to-transparent" />
          <div className="relative z-10 flex items-center h-full px-12">
            <div>
              <p className="font-label text-primary text-xs tracking-[0.2em] uppercase font-bold mb-2">
                Now Configurable
              </p>
              <h2 className="font-headline text-5xl font-black text-white tracking-tighter uppercase mb-2">
                {vehicle.name}
              </h2>
              <p className="text-secondary font-body mb-1">
                {vehicle.subtitle}
              </p>
              <p className="text-2xl font-headline font-bold text-white mt-4">
                Starting at{" "}
                <span className="text-primary">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(vehicle.basePrice)}
                </span>
              </p>
              <Link
                href="/configurator"
                className="btn-primary inline-block px-8 py-3 mt-6 primary-glow"
              >
                Configure Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="border-t border-white/5 py-20 text-center">
        <div className="w-px h-12 bg-primary mx-auto mb-8" />
        <h2 className="font-headline text-4xl font-bold text-white tracking-tighter mb-4">
          ENGINEERED FOR THE CLOUD.
        </h2>
        <p className="text-secondary max-w-lg mx-auto mb-8 text-sm uppercase tracking-wider">
          Join the select few who experience the pinnacle of cloud-native
          automotive engineering.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/configurator"
            className="bg-white text-surface px-8 py-3 font-headline font-black uppercase tracking-widest text-[10px] rounded-md hover:bg-primary transition-colors"
          >
            Build Yours
          </Link>
          <Link
            href="/gallery"
            className="text-white border border-white/20 px-8 py-3 font-headline font-black uppercase tracking-widest text-[10px] rounded-md hover:border-primary transition-colors"
          >
            Request Catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
