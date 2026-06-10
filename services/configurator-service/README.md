# Configurator Service (Micro-Frontend)

Vehicle-configuration **micro-frontend**. Owns both the configuration UI
(EJS, Tailwind, JS) *and* the configuration domain logic (option
validation, pricing, image resolution). Designed to be embedded into the
SSR web-shop-backend's `/configurator` page via `<iframe>`, but also runs
standalone for local debugging.

## What it does

- Renders a complete, self-contained HTML page with the configurator UI:
  body shot of the car, AI panel, color/wheel/interior selectors, price
  summary, "Continue to Checkout" button.
- Validates the user's selection against the live option tree pulled
  from the Product Service.
- Computes pricing (base + per-option deltas + tax + breakdown).
- Resolves the matching pre-rendered body-shot URL from MinIO via a
  consistent slug convention.
- Hands off the checkout click to the parent page via `postMessage`
  (so cart + order responsibilities stay with the SSR backend).

The service is **stateless** — no database, no Redis, no session. Every
request is independent. That keeps it horizontally scalable (ADR5).

## Routes

### `GET /`

The embeddable configurator HTML page. Reads `?color=…&wheels=…&interior=…`
from the query string, validates against the live option tree, renders
the EJS template. The asset base path is taken from the
`X-Forwarded-Prefix` request header so the rendered HTML works both:

- **standalone** (debug): `http://localhost:3008/` — assets relative to root
- **embedded behind backend proxy**: `http://localhost:3000/configurator-ui/`
  — assets are prefixed with `/configurator-ui` because the SSR backend
  sets `X-Forwarded-Prefix: /configurator-ui` when proxying.

### `GET /api/configurations/options/:vehicleSlug`

JSON. Returns the option tree (colors, wheels, interiors) plus the
canonical defaults the consumer should preselect. Kept for server-to-
server use.

### `POST /api/configurations/build`

JSON. Takes a selection, validates it, computes pricing, resolves the
image. Returns a complete configuration document. Kept for server-to-
server use (the SSR backend calls this from `/configurator/order` and
`/configurator/checkout` to re-validate before placing the order).

### `GET /health`

Returns `{ service: "configurator-service", status: "ok" }`.

## How the iframe-embed flow works

```
Browser
   │
   │  GET /configurator
   ▼
SSR backend (port 3000)
   │
   │  renders views/pages/configurator.ejs
   │  → <iframe src="/configurator-ui">
   │
   ▼
Browser loads iframe-src
   │
   │  GET /configurator-ui
   ▼
SSR backend's http-proxy-middleware
   │
   │  rewrites path → GET /
   │  sets X-Forwarded-Prefix: /configurator-ui
   ▼
Configurator Service (port 3008)
   │
   │  reads ?color=&wheels=&interior=
   │  fetches vehicle from product-service
   │  validates + prices + resolves image
   │  renders views/configurator.ejs
   ▼
HTML response (with /configurator-ui/css/app.css, /configurator-ui/js/configurator.js)
   │
   ▼
Browser renders iframe content
```

When the user clicks **Continue to Checkout** inside the iframe:

```
iframe JS
   │
   │  window.parent.postMessage({ action: 'configurator:checkout', ... })
   ▼
Host page (configurator-host.js in web-shop-backend)
   │
   │  fills hidden form, submits POST /configurator/order
   ▼
SSR backend kicks off the existing order flow
```

## Environment

| Variable                | Default                                  |
|-------------------------|------------------------------------------|
| `PORT`                  | `3008`                                   |
| `PRODUCT_SERVICE_URL`   | `http://localhost:3001`                  |
| `MEDIA_PUBLIC_URL`      | `http://localhost:9000/aether-images`    |
| `REQUEST_TIMEOUT_MS`    | `4000`                                   |
| `CACHE_TTL_MS`          | `60000`                                  |

## Architecture notes

- **HTTP/JSON to product-service** (ADR4) — same pattern as every other
  service.
- **No local catalogue duplicate** (ADR12) — on product-service outage
  we return HTTP 503, no stale prices.
- **MinIO image convention** (ADR9) — `bodyImageFor(slug, color, wheel)`
  must stay in sync with the filenames seeded by
  `infrastructure/minio/seed-images/vehicles/`.
- **Stateless horizontal scaling** (ADR5) — the 60s in-process cache is
  a per-instance optimisation, never a source of truth.
- **Micro-frontend pattern** (ADR13) — embedded via `<iframe>` behind
  the SSR backend's proxy, never publicly exposed. Asset paths adapt to
  the proxy prefix via `X-Forwarded-Prefix`.

## Build

```bash
npm install
npm run build:css     # compiles Tailwind into public/css/app.css
npm start             # serves on port 3008
```

The Dockerfile is multi-stage: build stage compiles Tailwind, runtime
stage ships only server + views + compiled assets.
