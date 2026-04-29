# Aether Motors — Frontend

Modern, high-end automobile platform frontend built with **Next.js 14** (App Router) and **Tailwind CSS**.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route            | Page                     | Description                                      |
| ---------------- | ------------------------ | ------------------------------------------------ |
| `/`              | Landing / Home           | Brand hero, vehicle showcase, ecosystem nav cards |
| `/configurator`  | Vehicle Configurator     | 3D-style view, color/wheel/interior selectors     |
| `/merchandise`   | Merchandise Shop         | Product grid, featured items, cart summary        |
| `/gallery`       | Impressions Gallery      | Bento media grid, hero video, CTA section         |
| `/roadmap`       | Road to Super Car        | Map route, countdown, telemetry, event info       |

## Component Overview

### Layout
| Component   | File                              | Description                     |
| ----------- | --------------------------------- | ------------------------------- |
| Header      | `components/layout/Header.tsx`    | Fixed nav bar with active links |
| Footer      | `components/layout/Footer.tsx`    | Copyright & policy links        |

### Shared UI
| Component    | File                           | Description                          |
| ------------ | ------------------------------ | ------------------------------------ |
| Button       | `components/ui/Button.tsx`     | 4 variants: primary/secondary/outline/ghost |
| Card         | `components/ui/Card.tsx`       | Glass & tonal card wrappers          |
| SectionTitle | `components/ui/SectionTitle.tsx` | Label + headline + description     |
| StatBadge    | `components/ui/StatBadge.tsx`  | Metric display (value + unit)        |
| IconButton   | `components/ui/IconButton.tsx` | Circular glass icon button           |

### Configurator
| Component         | File                                       | Description                  |
| ----------------- | ------------------------------------------ | ---------------------------- |
| ColorSelector     | `components/configurator/ColorSelector.tsx` | Gradient swatch picker       |
| WheelSelector     | `components/configurator/WheelSelector.tsx` | Wheel option list            |
| InteriorSelector  | `components/configurator/InteriorSelector.tsx` | Interior material picker  |
| PriceSummary      | `components/configurator/PriceSummary.tsx`  | Base + options + total       |

### Merchandise
| Component     | File                                        | Description               |
| ------------- | ------------------------------------------- | ------------------------- |
| CategoryTabs  | `components/merchandise/CategoryTabs.tsx`   | Filter tab bar            |
| ProductCard   | `components/merchandise/ProductCard.tsx`    | Standard product card     |
| FeaturedCard  | `components/merchandise/FeaturedCard.tsx`   | Large featured product    |
| CartSummary   | `components/merchandise/CartSummary.tsx`    | Shopping cart sidebar     |

### Gallery
| Component    | File                                   | Description               |
| ------------ | -------------------------------------- | ------------------------- |
| GalleryHero  | `components/gallery/GalleryHero.tsx`   | Full-width hero banner    |
| MediaGrid    | `components/gallery/MediaGrid.tsx`     | Bento-style media layout  |
| VideoCard    | `components/gallery/VideoCard.tsx`     | Video item with play btn  |

### Roadmap
| Component      | File                                     | Description              |
| -------------- | ---------------------------------------- | ------------------------ |
| CountdownCard  | `components/roadmap/CountdownCard.tsx`   | Event countdown timer    |
| TelemetryCard  | `components/roadmap/TelemetryCard.tsx`   | Navigation telemetry     |
| RouteMap       | `components/roadmap/RouteMap.tsx`        | SVG route map background |

## Mock Data Files

All mock data is in `src/data/`. Each file exports TypeScript types and sample data:

| File              | Exports                                           |
| ----------------- | ------------------------------------------------- |
| `vehicles.ts`     | `Vehicle`, `VehicleColor`, `WheelOption`, etc.    |
| `merchandise.ts`  | `Product`, `CartItem`, `products`, `mockCartItems` |
| `gallery.ts`      | `GalleryItem`, `galleryItems`                     |
| `route.ts`        | `RouteEvent`, `CountdownData`, `TelemetryData`    |

## Backend Integration Points

These are the data fields that Person 2 needs to wire up to real APIs:

### Configurator (`/configurator`)
| Data             | Source Service    | Current Mock          |
| ---------------- | ----------------- | --------------------- |
| Vehicle catalog  | product-service   | `data/vehicles.ts`    |
| Color options    | product-service   | `Vehicle.colors`      |
| Wheel options    | product-service   | `Vehicle.wheels`      |
| Interior options | product-service   | `Vehicle.interiors`   |
| Pricing          | product-service   | `Vehicle.basePrice`   |

### Merchandise (`/merchandise`)
| Data             | Source Service    | Current Mock              |
| ---------------- | ----------------- | ------------------------- |
| Product listing  | product-service   | `data/merchandise.ts`     |
| Categories       | product-service   | `categories` array        |
| Cart contents    | cart-service      | `mockCartItems`           |
| Add to cart      | cart-service      | Button click (no-op)      |
| Checkout         | order-service     | Button click (no-op)      |

### Gallery (`/gallery`)
| Data             | Source Service    | Current Mock          |
| ---------------- | ----------------- | --------------------- |
| Media items      | media-service     | `data/gallery.ts`     |
| Video content    | media-service     | `GalleryItem.image`   |

### Roadmap (`/roadmap`)
| Data             | Source Service    | Current Mock          |
| ---------------- | ----------------- | --------------------- |
| Route info       | route-service     | `data/route.ts`       |
| Event data       | route-service     | `routeEvent`          |
| Countdown        | route-service     | `countdown`           |
| Telemetry        | route-service     | `telemetry`           |
| AI insights      | ai-service        | Not yet integrated    |

## Design System

- **Primary:** `#00daf8` (Electric Blue)
- **Surface:** `#121314` (Deep Charcoal)
- **Headlines:** Space Grotesk (bold, tight tracking)
- **Body:** Manrope (clean, geometric)
- **Glass panels:** `rgba(31,32,33,0.4)` + `backdrop-blur(16px)`
- **CTA gradient:** `linear-gradient(135deg, #00daf8, #009fb5)`

Full configuration in `tailwind.config.ts`.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS 3.4
- Google Material Symbols (icons)
