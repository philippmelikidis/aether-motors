"use client";

import { useState } from "react";
import Image from "next/image";
import { defaultVehicle } from "@/data/vehicles";
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

      {/* CENTER */}
      <main className="flex-1 relative overflow-hidden">
        {/* Vehicle Image */}
        <Image
          src={vehicle.image}
          alt={vehicle.name}
          fill
          sizes="(min-width: 1024px) 75vw, 100vw"
          className="object-cover opacity-80"
          priority
          unoptimized
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/80 via-transparent to-transparent" />

        {/* Floating Stats - Bottom Left */}
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

        {/* Config Sidebar - Top Right */}
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

        {/* Bottom Right - Action Buttons */}
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
