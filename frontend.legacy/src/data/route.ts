import { mediaUrl } from "@/lib/media";

export interface RouteEvent {
  id: string;
  title: string;
  location: string;
  arrivalEta: string;
  distance: string;
}

export interface CountdownData {
  label: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TelemetryData {
  unitName: string;
  unitId: string;
  progress: number;
  viewMode: string;
  syncStatus: string;
}

export interface RouteWaypoint {
  name: string;
  type: "start" | "destination";
  lat: number;
  lng: number;
}

export const routeEvent: RouteEvent = {
  id: "global-premiere",
  title: "Global Premiere",
  location: "Stuttgart Test Track",
  arrivalEta: "09:15 AM",
  distance: "12.4 KM",
};

export const countdown: CountdownData = {
  label: "Unveiling In",
  hours: 2,
  minutes: 48,
  seconds: 14,
};

export const telemetry: TelemetryData = {
  unitName: "Fleet Unit 04-Z",
  unitId: "04-Z",
  progress: 65,
  viewMode: "3D Cinematic",
  syncStatus: "Connected",
};

export const waypoints: RouteWaypoint[] = [
  {
    name: "Stuttgart Test Track",
    type: "start",
    lat: 48.7758,
    lng: 9.1829,
  },
  {
    name: "Zenith Pavilion",
    type: "destination",
    lat: 48.7831,
    lng: 9.1802,
  },
];

export const mapImage: string = mediaUrl("routes/zenith-route");
