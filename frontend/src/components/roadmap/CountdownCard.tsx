"use client";

import type { CountdownData } from "@/data/route";

// TODO: Replace static data with live countdown from backend

interface CountdownCardProps {
  data: CountdownData;
}

export default function CountdownCard({ data }: CountdownCardProps) {
  const units = [
    { value: data.hours, label: "HRS" },
    { value: data.minutes, label: "MIN" },
    { value: data.seconds, label: "SEC" },
  ];

  return (
    <div className="glass-card rounded-xl p-6">
      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-2">
        {data.label}
      </p>

      <div className="flex gap-4 items-baseline">
        {units.map((unit, i) => (
          <div key={unit.label} className="contents">
            {i > 0 && (
              <span className="text-xl text-primary/40 font-black">:</span>
            )}
            <div className="flex flex-col items-center">
              <span className="text-3xl font-headline font-black tracking-tighter">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-[8px] text-secondary/60 uppercase tracking-widest">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
