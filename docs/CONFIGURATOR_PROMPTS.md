# Configurator Asset Prompts

Image-generation prompts for the configurator assets used by the SSR
configurator page (`backend/web-shop-backend/views/pages/configurator.ejs`).
The page renders one pre-baked (colour × wheel) combo body shot per
selection — no runtime overlay. All assets live in MinIO under the keys
listed below; generate them, save with the shown filename, drop them into
`infrastructure/minio/seed-images/<subfolder>/<filename>` and re-run
`docker compose up`.

Tested with Midjourney v6 / DALL·E 3 / Stable Diffusion XL — the prompts
work across all three. Tweak the artistic style block to taste, but keep
the **technical constraints** (aspect ratio, background, perspective) so
swapping between renders feels like a real configurator rather than a
slideshow of unrelated images.

---

## 1. Body shots (3 files)

**Filenames**

| File | MinIO key |
| --- | --- |
| `vehicles/project-zenith-metallic-blue.jpg`   | `vehicles/project-zenith-metallic-blue` |
| `vehicles/project-zenith-matte-charcoal.jpg`  | `vehicles/project-zenith-matte-charcoal` |
| `vehicles/project-zenith-pearl-white.jpg`     | `vehicles/project-zenith-pearl-white` |

**Technical constraints — keep these stable across all three renders**

- Aspect ratio **16:9** (2048 × 1152 recommended)
- Camera angle: **3/4 front-side view**, slightly elevated (~5° above
  shoulder height), car centred horizontally
- Background: **seamless dark studio**, deep charcoal (`#0D1B2A` area),
  no horizon line, soft directional rim light from upper-right
- The car body fills roughly 60 % of the frame width
- Default wheels visible at both axles — they will be hidden by the
  overlay PNGs at runtime, so render them as plain dark alloys
- Photorealistic, no text/logo/watermark

**Base prompt (paste once, then swap `<PAINT>` per file)**

```
Studio photograph of a futuristic electric hypercar inspired by McLaren
Speedtail and Pininfarina Battista, 3/4 front-side view, slightly elevated
camera, low-poly aerodynamic silhouette with sharp shoulder line and
flush glass canopy. Body finished in <PAINT>. Default 5-spoke dark grey
alloy wheels. Seamless deep-charcoal studio background, no horizon,
soft directional rim light from the upper right, subtle floor reflection.
Editorial automotive photography, sharp focus, photorealistic, ultra
detailed, 16:9, no text, no logo, no watermark.
```

**`<PAINT>` per file**

| File | `<PAINT>` value |
| --- | --- |
| metallic-blue | `metallic cyan-blue paint (≈#00DAF8 base, fading to #004E5A in shadow) with a subtle pearl shimmer` |
| matte-charcoal | `matte charcoal-grey paint (≈#292A2B) with a satin finish that scatters highlights softly` |
| pearl-white | `pearl-white paint (≈#E3E2E3) with a faint iridescent shift toward champagne in highlights` |

> **Important:** generate all three in the same session / seed so the
> camera angle, framing and lighting stay consistent. If you re-run a
> single colour later, lock the seed.

---

## 2. Wheel overlays (2 files, **PNG with transparent background**)

**Filenames**

| File | MinIO key |
| --- | --- |
| `vehicles/wheels/aero-blade-21.png`   | `vehicles/wheels/aero-blade-21.png` |
| `vehicles/wheels/onyx-turbine-22.png` | `vehicles/wheels/onyx-turbine-22.png` |

**Technical constraints — non-negotiable, otherwise the overlay won't
work**

- **Square**, 1024 × 1024
- **Fully transparent background** (PNG with alpha channel). DALL·E /
  Midjourney don't natively output alpha — generate on a flat lime-green
  or chroma-magenta background and use [remove.bg](https://www.remove.bg)
  or `rembg` afterwards.
- Wheel rendered **dead-centre, perfectly straight-on side view** (i.e.
  the rim is a perfect circle, not an ellipse)
- Tire included, full diameter fills ~92 % of the canvas
- No shadow under the wheel — the configurator applies its own `drop-shadow`
- No motion blur, no text

**Prompt for `aero-blade-21.png`**

```
Single 21-inch high-performance car wheel, perfectly centred straight-on
side view (rim shown as a perfect circle), aerodynamic blade-style design
with five flowing aero blades in satin black with subtle bronze accents,
optimised-for-low-drag aesthetic, mounted on a low-profile black tire
with discreet sidewall sculpting. Studio product shot on a flat lime
green (#00FF00) background for chroma keying, no shadow, no reflection,
sharp focus, photorealistic, ultra detailed, square 1024x1024, no text,
no logo.
```

**Prompt for `onyx-turbine-22.png`**

```
Single 22-inch forged carbon turbine-style car wheel, perfectly centred
straight-on side view (rim shown as a perfect circle), five interlocking
turbine blades in glossy black with exposed carbon weave between the
spokes, deep concave dish, motorsport aesthetic. Mounted on a low-profile
black tire. Studio product shot on a flat lime green (#00FF00) background
for chroma keying, no shadow, no reflection, sharp focus, photorealistic,
ultra detailed, square 1024x1024, no text, no logo.
```

**Post-processing**

```bash
# remove the green/magenta backdrop -> PNG with alpha
brew install rembg  # or: pipx install rembg
rembg i aero-blade-21-raw.png aero-blade-21.png
rembg i onyx-turbine-22-raw.png onyx-turbine-22.png
```

> The two wheels should have **the same outer-tyre diameter on canvas**
> (~92 % of the 1024 px). Both overlays use the same hotspot, so size
> mismatches show up as the wheel jumping when the user switches options.

---

## 3. Interior detail shots (2 files)

**Filenames**

| File | MinIO key |
| --- | --- |
| `vehicles/interiors/cyber-knit.jpg`  | `vehicles/interiors/cyber-knit` |
| `vehicles/interiors/vegan-suede.jpg` | `vehicles/interiors/vegan-suede` |

**Technical constraints**

- Aspect ratio **3:2** (1500 × 1000 works well) — the inset crops to 16:10
- Tight shot of the driver-seat shoulder + headrest, steering wheel
  partly in frame on the left, dashboard hints visible on the right
- Dramatic side lighting from the right (driver-door window light)
- Photorealistic, editorial style

**Prompt for `cyber-knit.jpg`**

```
Tight editorial photograph of a futuristic hypercar driver seat
upholstered in recycled-PET cyan-knit fabric with a geometric tessellation
pattern, contrast stitching in slightly darker teal, exposed carbon-
fibre seat shell. Composition: 3/4 shoulder-and-headrest framing, steering
wheel just entering the left edge, blurred carbon dashboard on the right.
Dramatic warm side lighting from the right (window light), deep shadows
on the left. Cinematic, automotive editorial, shallow depth of field,
photorealistic, 3:2 aspect ratio, no text, no logo.
```

**Prompt for `vegan-suede.jpg`**

```
Tight editorial photograph of a futuristic hypercar driver seat in dark
charcoal vegan suede with grey active-mesh inserts down the centre,
contrast white stitching, exposed carbon-fibre seat shell. Composition:
3/4 shoulder-and-headrest framing, steering wheel just entering the left
edge, blurred carbon dashboard on the right. Cool moody side lighting
from the right, deep shadows. Cinematic, automotive editorial, shallow
depth of field, photorealistic, 3:2 aspect ratio, no text, no logo.
```

---

## Drop-in checklist

The configurator picks one pre-rendered body shot per (colour × wheel)
selection. 3 colours × 2 wheels = 6 body shots, plus small wheel
thumbnails for the selector cards and 3 interior detail shots.

```
infrastructure/minio/seed-images/
├── vehicles/
│   ├── project-zenith.png                            ← Hero (default)
│   ├── project-zenith-metallic-blue-aero.png
│   ├── project-zenith-metallic-blue-onyx.png
│   ├── project-zenith-matte-charcoal-aero.png
│   ├── project-zenith-matte-charcoal-onyx.png
│   ├── project-zenith-pearl-white-aero.png
│   ├── project-zenith-pearl-white-onyx.png
│   ├── wheels/
│   │   ├── aero-blade-21.png            ← small selector thumbnail
│   │   └── onyx-turbine-22.png          ← small selector thumbnail
│   └── interiors/
│       ├── cyber-knit.png
│       ├── vegan-suede.png
│       └── leather-package.png
```

Then:

```bash
docker compose down -v
docker compose up --build
# In the minio-init log you should see one "local …" line per file.
```

## Consistency tips

- **Lock the seed / style-reference across body shots.** Whatever generator
  you use, render the six combos with the same composition seed (Midjourney
  `--sref <url>` or DALL·E "same camera and framing as before"). If the
  camera angle drifts between renders, swapping options feels like a
  slideshow rather than a configurator.
- **Background should always be the same deep-charcoal studio** so the
  surrounding `<surface>` colour blends in without a visible seam.
- **Default wheels in the prompt should mention the actual wheel design**
  (aero turbofan style for `-aero.png`, forged carbon turbine for
  `-onyx.png`) so the rendered wheels match the selector thumbnail. The
  EJS template renders the body shot directly — there is no runtime overlay
  that could hide a mismatched wheel.
- **Image filenames are mapped from DB slugs.** The mapping is encoded in
  `backend/web-shop-backend/lib/productClient.js` (`WHEEL_SUFFIX` and
  `bodyImageFor`). Adding a new colour or wheel option in the DB requires
  matching files here and a one-line update in `WHEEL_SUFFIX`.
