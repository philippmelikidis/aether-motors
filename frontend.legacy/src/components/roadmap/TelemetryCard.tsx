import type { TelemetryData } from "@/data/route";

// TODO: Replace with real-time telemetry from route-service

interface TelemetryCardProps {
  data: TelemetryData;
}

export default function TelemetryCard({ data }: TelemetryCardProps) {
  return (
    <div className="glass-card p-8 rounded-xl w-[520px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-headline font-bold uppercase text-sm tracking-widest">
            Active Navigation
          </h3>
          <p className="text-[10px] text-secondary/60 uppercase tracking-widest mt-1">
            Unit {data.unitId}
          </p>
        </div>
        <div className="flex gap-0.5 items-end">
          <div className="w-1 h-2 rounded-full bg-primary opacity-40" />
          <div className="w-1 h-3 rounded-full bg-primary opacity-60" />
          <div className="w-1 h-4 rounded-full bg-primary" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative mb-8">
        <div
          className="absolute left-0 h-full primary-gradient-glow rounded-full"
          style={{ width: `${data.progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"
          style={{ left: `${data.progress}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex justify-between items-center">
        {/* View Mode */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/20 transition-colors flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-lg">view_in_ar</span>
          </div>
          <div>
            <p className="text-[10px] text-secondary/60 uppercase tracking-widest">
              View Mode
            </p>
            <p className="text-xs font-headline font-bold">{data.viewMode}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-white/10" />

        {/* Sync Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 hover:bg-primary/20 transition-colors flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-lg">cloud_sync</span>
          </div>
          <div>
            <p className="text-[10px] text-secondary/60 uppercase tracking-widest">
              Sync Status
            </p>
            <p className="text-xs font-headline font-bold">{data.syncStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
