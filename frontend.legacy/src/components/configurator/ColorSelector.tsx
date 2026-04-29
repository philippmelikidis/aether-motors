"use client";

import { VehicleColor } from "@/data/vehicles";

interface ColorSelectorProps {
  colors: VehicleColor[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ColorSelector({
  colors,
  selectedId,
  onSelect,
}: ColorSelectorProps) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-lg">
          palette
        </span>
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
          Exterior Color
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {colors.map((color) => {
          const isSelected = color.id === selectedId;
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`aspect-square w-full rounded-lg transition-all duration-300 ${
                  isSelected
                    ? "border-2 border-primary shadow-[0_0_15px_rgba(0,218,248,0.3)]"
                    : "border border-white/10 opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: `linear-gradient(135deg, ${color.hex}, ${color.hexTo})`,
                }}
              />
              <span
                className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${
                  isSelected ? "text-primary" : "text-secondary/60"
                }`}
              >
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
