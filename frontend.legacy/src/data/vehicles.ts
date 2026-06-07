import { mediaUrl } from "@/lib/media";

export interface VehicleColor {
  id: string;
  name: string;
  hex: string;
  hexTo: string;
  price: number;
  /** MinIO key for the per-color body shot (JPG). Falls back to the base
   * vehicle.image when undefined. */
  imageKey?: string;
}

export interface WheelOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  /** MinIO key for the transparent-PNG wheel overlay. When set, two copies
   * are layered on top of the body shot at the vehicle's `wheelHotspots`. */
  overlayKey?: string;
}

export interface InteriorOption {
  id: string;
  name: string;
  material: string;
  price: number;
  /** MinIO key for the interior detail shot shown as an inset. */
  detailKey?: string;
}

export interface VehicleSpec {
  label: string;
  value: string;
  unit: string;
}

/** Position + size for a wheel overlay, expressed as % of the hero image
 *  container so the overlay scales with the viewport. */
export interface WheelHotspot {
  /** Centre-x of the wheel as % from the left of the image. */
  xPercent: number;
  /** Centre-y of the wheel as % from the top of the image. */
  yPercent: number;
  /** Wheel diameter as % of image width. */
  sizePercent: number;
}

export interface Vehicle {
  id: string;
  name: string;
  subtitle: string;
  /** Base body shot used as a fallback when no per-color render is uploaded. */
  image: string;
  basePrice: number;
  specs: VehicleSpec[];
  colors: VehicleColor[];
  wheels: WheelOption[];
  interiors: InteriorOption[];
  /** Where the front and back wheels appear in the body shot. Used to layer
   *  the transparent-PNG wheel overlays. Coordinates are tuned for the
   *  uploaded 3/4-front-side renders; adjust when swapping out the body
   *  photography. */
  wheelHotspots?: {
    front: WheelHotspot;
    back: WheelHotspot;
  };
}

export const vehicles: Vehicle[] = [
  {
    id: "project-zenith",
    name: "Project Zenith",
    subtitle: "V12 Hybrid Concept",
    image: mediaUrl("vehicles/project-zenith"),
    basePrice: 142000,
    specs: [
      { label: "Acceleration", value: "1.9", unit: "s" },
      { label: "Range", value: "640", unit: "km" },
      { label: "Top Speed", value: "325", unit: "km/h" },
    ],
    colors: [
      {
        id: "metallic-blue",
        name: "Metallic Blue",
        hex: "#00daf8",
        hexTo: "#004e5a",
        price: 0,
        imageKey: "vehicles/project-zenith-metallic-blue.png",
      },
      {
        id: "matte-charcoal",
        name: "Matte Charcoal",
        hex: "#292a2b",
        hexTo: "#1a1a1a",
        price: 2200,
        imageKey: "vehicles/project-zenith-matte-charcoal.png",
      },
      {
        id: "pearl-white",
        name: "Pearl White",
        hex: "#e3e2e3",
        hexTo: "#c4c4c4",
        price: 1800,
        imageKey: "vehicles/project-zenith-pearl-white.png",
      },
    ],
    wheels: [
      {
        id: "aero-blade-21",
        name: '21" Aero Blade',
        description: "Optimized Drag",
        icon: "blur_circular",
        price: 0,
        overlayKey: "vehicles/wheels/aero-blade-21.png",
      },
      {
        id: "onyx-turbine-22",
        name: '22" Onyx Turbine',
        description: "Forged Carbon",
        icon: "toll",
        price: 4500,
        overlayKey: "vehicles/wheels/onyx-turbine-22.png",
      },
    ],
    interiors: [
      {
        id: "cyber-knit",
        name: "Cyber Knit",
        material: "Recycled PET",
        price: 0,
        detailKey: "vehicles/interiors/cyber-knit.png",
      },
      {
        id: "vegan-suede",
        name: "Vegan Suede",
        material: "Active Mesh",
        price: 3200,
        detailKey: "vehicles/interiors/vegan-suede.png",
      },
    ],
    // Hotspots tuned for the blue body-shot render (3/4 front-side, camera
    // ~5° elevation, 35mm-equivalent framing). If you swap out the body
    // photography for a different perspective, re-measure these:
    //   xPercent / yPercent → centre of the wheel as % of the hero image
    //   sizePercent         → wheel diameter as % of hero image width
    wheelHotspots: {
      front: { xPercent: 71, yPercent: 71, sizePercent: 17 },
      back:  { xPercent: 21, yPercent: 71, sizePercent: 14 },
    },
  },
];

export const defaultVehicle: Vehicle = vehicles[0];
