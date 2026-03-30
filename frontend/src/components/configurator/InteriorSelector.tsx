"use client";

import { InteriorOption } from "@/data/vehicles";

interface InteriorSelectorProps {
  interiors: InteriorOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function InteriorSelector({
  interiors,
  selectedId,
  onSelect,
}: InteriorSelectorProps) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-lg">
          texture
        </span>
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
          Interior Design
        </h3>
      </div>

      <div className="flex gap-4">
        {interiors.map((interior) => {
          const isSelected = interior.id === selectedId;
          return (
            <button
              key={interior.id}
              onClick={() => onSelect(interior.id)}
              className={`flex-1 p-2 rounded-lg text-center transition-all duration-300 ${
                isSelected
                  ? "border border-primary bg-primary/5"
                  : "border border-white/10 hover:bg-white/5"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface">
                {interior.name}
              </div>
              <div
                className={`text-[9px] mt-0.5 ${
                  isSelected ? "text-primary/60" : "text-secondary/60"
                }`}
              >
                {interior.material}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
