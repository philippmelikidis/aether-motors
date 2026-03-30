import Image from "next/image";
import type { RouteWaypoint } from "@/data/route";

interface RouteMapProps {
  mapImage: string;
  waypoints: RouteWaypoint[];
}

export default function RouteMap({ mapImage, waypoints }: RouteMapProps) {
  const destination = waypoints.find((w) => w.type === "destination");

  return (
    <div className="absolute inset-0">
      {/* Layer 1: Dot grid background */}
      <div className="absolute inset-0 map-grid bg-surface" />

      {/* Layer 2: SVG route path */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[80%] h-[60%]">
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Glow path */}
            <path
              d="M100,400 Q250,380 300,250 T600,100"
              stroke="var(--color-primary)"
              strokeOpacity="0.5"
              strokeWidth="3"
              strokeDasharray="12 6"
              filter="url(#glow)"
            />
            {/* Main path */}
            <path
              d="M100,400 Q250,380 300,250 T600,100"
              stroke="var(--color-primary)"
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="12 6"
            />
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Start marker */}
          <div className="absolute bottom-[20%] left-[12%] -translate-x-1/2 translate-y-1/2">
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
          </div>

          {/* Destination marker */}
          <div className="absolute top-[16%] right-[22%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            {/* Pulsing rings */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 rounded-full border border-primary/30 animate-ping" />
              <div className="absolute w-5 h-5 rounded-full border border-primary/50" />
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]" />
            </div>
            {/* Glass label */}
            {destination && (
              <div className="glass-card rounded-lg px-3 py-1.5 mt-2">
                <p className="text-[10px] font-headline font-bold uppercase tracking-widest whitespace-nowrap">
                  {destination.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layer 3: Satellite map image overlay */}
      <div className="absolute inset-0 mix-blend-overlay opacity-20 grayscale">
        <Image
          src={mapImage}
          alt="Satellite map overlay"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}
