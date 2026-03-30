import {
  routeEvent,
  countdown,
  telemetry,
  waypoints,
  mapImage,
} from "@/data/route";
import CountdownCard from "@/components/roadmap/CountdownCard";
import TelemetryCard from "@/components/roadmap/TelemetryCard";
import RouteMap from "@/components/roadmap/RouteMap";

const navItems = [
  { label: "Models", icon: "directions_car" },
  { label: "Performance", icon: "speed" },
  { label: "Interior", icon: "chair" },
  { label: "Summary", icon: "summarize", active: true },
];

export default function RoadmapPage() {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Left sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-white/5 z-40 py-20">
        <div className="px-6 mb-10">
          <h2 className="text-primary font-headline font-black text-lg uppercase tracking-widest">
            Project Zenith
          </h2>
          <p className="text-[10px] text-secondary/60 uppercase tracking-widest mt-1">
            V12 Hybrid Concept
          </p>
        </div>

        {/* Nav buttons */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-secondary/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span className="text-xs font-headline font-bold uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Save Configuration button */}
        <div className="absolute bottom-20 left-0 w-full px-4">
          <button className="w-full primary-gradient-glow text-on-primary-container font-headline font-black uppercase tracking-widest text-xs rounded-lg py-3 transition-all hover:brightness-110 active:scale-95">
            Save Configuration
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="pl-64 pt-20 pb-20 relative overflow-hidden h-full">
        {/* Background map layer */}
        <RouteMap mapImage={mapImage} waypoints={waypoints} />

        {/* Floating UI overlays */}
        <div className="relative z-10 p-12 h-full flex flex-col justify-between pointer-events-none">
          {/* TOP row */}
          <div className="flex gap-6 pointer-events-auto">
            {/* Event info card */}
            <div className="glass-card rounded-xl p-6 w-96">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">
                  event_upcoming
                </span>
                <h3 className="font-headline font-bold uppercase text-sm tracking-widest">
                  {routeEvent.title}
                </h3>
              </div>
              <p className="text-[10px] text-secondary/60 uppercase tracking-widest mb-4">
                {routeEvent.location}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-secondary/40 uppercase tracking-widest mb-1">
                    Arrival ETA
                  </p>
                  <p className="text-sm font-headline font-bold">
                    {routeEvent.arrivalEta}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-secondary/40 uppercase tracking-widest mb-1">
                    Distance
                  </p>
                  <p className="text-sm font-headline font-bold">
                    {routeEvent.distance}
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown card */}
            <CountdownCard data={countdown} />
          </div>

          {/* BOTTOM row */}
          <div className="flex justify-between items-end gap-6 pointer-events-auto">
            {/* Telemetry card */}
            <TelemetryCard data={telemetry} />

            {/* Right side action buttons */}
            <div className="flex flex-col gap-4 items-end">
              <button className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">layers</span>
              </button>
              <button className="w-14 h-14 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">gps_fixed</span>
              </button>
              <button className="px-10 py-5 primary-gradient-glow rounded-xl font-headline font-black uppercase tracking-widest text-sm text-on-primary-container flex items-center gap-3 hover:brightness-110 transition-all active:scale-95">
                Initiate Drive
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
