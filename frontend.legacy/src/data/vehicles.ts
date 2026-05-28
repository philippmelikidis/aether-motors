import { mediaUrl } from "@/lib/media";

export interface VehicleColor {
  id: string;
  name: string;
  hex: string;
  hexTo: string;
  price: number;
  /** Optional override image (MinIO key without extension). Falls back to the
   * base vehicle image when undefined, so per-color renders can be added later
   * by uploading e.g. `vehicles/project-zenith-matte-charcoal.jpg` and
   * pointing `imageKey` at it. */
  imageKey?: string;
}

export interface WheelOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  /** Optional detail image (MinIO key) shown as inset when this wheel is
   *  selected. */
  detailKey?: string;
}

export interface InteriorOption {
  id: string;
  name: string;
  material: string;
  price: number;
  /** Optional detail image (MinIO key) shown as inset when this interior
   *  is selected. */
  detailKey?: string;
}

export interface VehicleSpec {
  label: string;
  value: string;
  unit: string;
}

export interface Vehicle {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  basePrice: number;
  specs: VehicleSpec[];
  colors: VehicleColor[];
  wheels: WheelOption[];
  interiors: InteriorOption[];
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
      },
      {
        id: "matte-charcoal",
        name: "Matte Charcoal",
        hex: "#292a2b",
        hexTo: "#1a1a1a",
        price: 2200,
      },
      {
        id: "pearl-white",
        name: "Pearl White",
        hex: "#e3e2e3",
        hexTo: "#c4c4c4",
        price: 1800,
      },
    ],
    wheels: [
      {
        id: "aero-blade-21",
        name: '21" Aero Blade',
        description: "Optimized Drag",
        icon: "blur_circular",
        price: 0,
        // Falls back to the cockpit detail shot until dedicated wheel
        // photography is uploaded to MinIO.
        detailKey: "gallery/carbon-lite-alloys",
      },
      {
        id: "onyx-turbine-22",
        name: '22" Onyx Turbine',
        description: "Forged Carbon",
        icon: "toll",
        price: 4500,
        detailKey: "gallery/carbon-lite-alloys",
      },
    ],
    interiors: [
      {
        id: "cyber-knit",
        name: "Cyber Knit",
        material: "Recycled PET",
        price: 0,
        detailKey: "gallery/the-cockpit",
      },
      {
        id: "vegan-suede",
        name: "Vegan Suede",
        material: "Active Mesh",
        price: 3200,
        detailKey: "gallery/the-cockpit",
      },
    ],
  },
];

export const defaultVehicle: Vehicle = vehicles[0];
