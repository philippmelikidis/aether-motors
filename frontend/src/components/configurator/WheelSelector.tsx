"use client";

import { WheelOption } from "@/data/vehicles";

interface WheelSelectorProps {
  wheels: WheelOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function WheelSelector({
  wheels,
  selectedId,
  onSelect,
}: WheelSelectorProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-lg">
          settings_input_component
        </span>
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface">
          Performance Wheels
        </h3>
      </div>

      <div className="space-y-3">
        {wheels.map((wheel) => {
          const isSelected = wheel.id === selectedId;
          return (
            <button
              key={wheel.id}
              onClick={() => onSelect(wheel.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                isSelected
                  ? "bg-white/5 border border-primary/20"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-lg">
                  {wheel.icon}
                </span>
              </div>

              <div className="flex-1 text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  {wheel.name}
                </div>
                <div className="text-[10px] text-secondary/60">
                  {wheel.description}
                </div>
              </div>

              <div
                className={`text-xs font-bold shrink-0 ${
                  isSelected ? "text-primary" : "text-secondary"
                }`}
              >
                {isSelected ? "Incl." : `+ ${formatPrice(wheel.price)}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
