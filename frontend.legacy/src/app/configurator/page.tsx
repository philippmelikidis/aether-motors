"use client";

import { useState } from "react";
import Image from "next/image";
import { defaultVehicle } from "@/data/vehicles";
import { mediaUrl } from "@/lib/media";
import ColorSelector from "@/components/configurator/ColorSelector";
import WheelSelector from "@/components/configurator/WheelSelector";
import InteriorSelector from "@/components/configurator/InteriorSelector";
import PriceSummary from "@/components/configurator/PriceSummary";

const navItems = [
  { label: "Models", icon: "directions_car", active: true },
  { label: "Performance", icon: "speed", active: false },
  { label: "Interior", icon: "weekend", active: false },
  { label: "Summary", icon: "receipt_long", active: false },
];

export default function ConfiguratorPage() {
  const vehicle = defaultVehicle;

  const [selectedColorId, setSelectedColorId] = useState(vehicle.colors[0].id);
  const [selectedWheelId, setSelectedWheelId] = useState(vehicle.wheels[0].id);
  const [selectedInteriorId, setSelectedInteriorId] = useState(
    vehicle.interiors[0].id
  );

  const selectedColor = vehicle.colors.find((c) => c.id === selectedColorId);
  const selectedWheel = vehicle.wheels.find((w) => w.id === selectedWheelId);
  const selectedInterior = vehicle.interiors.find(
    (i) => i.id === selectedInteriorId
  );

  const optionsPrice =
    (selectedColor?.price ?? 0) +
    (selectedWheel?.price ?? 0) +
    (selectedInterior?.price ?? 0);

  // Layer 1: body shot for the currently selected colour. Falls back to the
  // base vehicle render so the configurator still works before per-colour
  // photography is uploaded.
  const heroImage = selectedColor?.imageKey
    ? mediaUrl(selectedColor.imageKey)
    : vehicle.image;

  // Layer 2 (optional): transparent-PNG wheel overlay rendered twice, once
  // per hotspot. Only mounted when both the wheel asset and the hotspots
  // metadata are defined.
  const wheelOverlay =
    selectedWheel?.overlayKey && vehicle.wheelHotspots
      ? mediaUrl(selectedWheel.overlayKey)
      : null;

  return (
    <div className="flex min-h-screen pt-24">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-white/5 flex flex-col p-6 shrink-0">
        <div className="mb-8">
          <h1 className="text-primary font-bold font-headline text-lg">
            {vehicle.name}
          </h1>
          <p className="text-xs text-secondary/60 mt-1">{vehicle.subtitle}</p>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 hover:translate-x-1 ${item.active
                ? "text-primary bg-primary/10"
                : "text-secondary/60 hover:text-on-surface hover:bg-white/5"
                }`}
            >
              <span className="material-symbols-outlined text-lg">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="w-full mt-6 py-3 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-secondary/60 hover:text-on-surface hover:border-white/20 transition-all duration-300">
          Save Configuration
        </button>
      </aside>

      {/* CENTER — Layered car render */}
      <main className="flex-1 relative overflow-hidden">
        {/*
          Layered rendering, painter's algorithm:
            1) body shot (per colour)
            2) wheel overlays (transparent PNG, positioned via hotspots)
            3) gradient overlays for readability
            4) interior inset
            5) HUD (stats, sidebar, action buttons)
        */}

        {/* (1) Body shot. `key` is set so React re-mounts on swap, which
            gives us a clean cross-fade rather than a hard cut. We use
            object-contain so the whole car (including the wheels) stays
            visible regardless of viewport aspect; the surrounding letterbox
            blends into the dark surface background. */}
        <Image
          key={heroImage}
          src={heroImage}
          alt={`${vehicle.name} in ${selectedColor?.name ?? "default colour"}`}
          fill
          sizes="(min-width: 1024px) 75vw, 100vw"
          className="object-contain opacity-95 transition-opacity duration-700"
          priority
          unoptimized
        />

        {/* (2) Wheel overlays. We use a plain <img> instead of next/image
            because the asset has an alpha channel and Next would re-encode
            it as a lossy JPEG, breaking the transparency. */}
        {wheelOverlay && vehicle.wheelHotspots && (
          <>
            <img
              key={`${selectedWheel?.id}-front`}
              src={wheelOverlay}
              alt=""
              aria-hidden
              className="absolute pointer-events-none transition-all duration-500 drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
              style={{
                left: `${vehicle.wheelHotspots.front.xPercent}%`,
                top: `${vehicle.wheelHotspots.front.yPercent}%`,
                width: `${vehicle.wheelHotspots.front.sizePercent}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <img
              key={`${selectedWheel?.id}-back`}
              src={wheelOverlay}
              alt=""
              aria-hidden
              className="absolute pointer-events-none transition-all duration-500 drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
              style={{
                left: `${vehicle.wheelHotspots.back.xPercent}%`,
                top: `${vehicle.wheelHotspots.back.yPercent}%`,
                width: `${vehicle.wheelHotspots.back.sizePercent}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </>
        )}

        {/* (3) Gradient overlays for HUD readability — kept subtle so the
            body shot underneath stays readable. */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-surface/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/50 via-transparent to-transparent pointer-events-none" />

        {/* (4) Interior inset – swaps based on selection. */}
        {selectedInterior?.detailKey && (
          <figure className="absolute bottom-32 left-8 z-10 w-44 h-28 rounded-lg overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm shadow-xl">
            <Image
              key={selectedInterior.id}
              src={mediaUrl(selectedInterior.detailKey)}
              alt={selectedInterior.name}
              fill
              sizes="180px"
              className="object-cover"
              unoptimized
            />
            <figcaption className="absolute bottom-0 inset-x-0 text-[10px] uppercase tracking-widest text-white/90 bg-black/50 px-2 py-1">
              {selectedInterior.name}
            </figcaption>
          </figure>
        )}

        {/* (5) HUD – stats bottom-left, config panel top-right. */}
        <div className="absolute bottom-8 left-8 flex gap-8">
          {vehicle.specs.map((spec) => (
            <div key={spec.label} className="text-center">
              <div className="text-3xl font-headline font-black text-on-surface">
                {spec.value}
                <span className="text-sm text-primary ml-1">{spec.unit}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-secondary/60 mt-1">
                {spec.label}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute top-4 right-4 w-96 flex flex-col gap-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          <ColorSelector
            colors={vehicle.colors}
            selectedId={selectedColorId}
            onSelect={setSelectedColorId}
          />
          <WheelSelector
            wheels={vehicle.wheels}
            selectedId={selectedWheelId}
            onSelect={setSelectedWheelId}
          />
          <InteriorSelector
            interiors={vehicle.interiors}
            selectedId={selectedInteriorId}
            onSelect={setSelectedInteriorId}
          />
          <PriceSummary
            basePrice={vehicle.basePrice}
            optionsPrice={optionsPrice}
          />
        </div>

        <div className="absolute bottom-8 right-8 flex gap-3">
          {["360", "share", "help"].map((icon) => (
            <button
              key={icon}
              className="glass-panel rounded-full w-12 h-12 flex items-center justify-center hover:bg-white/10 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-secondary text-lg">
                {icon}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
