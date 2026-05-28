# Aether Motors – Bundled Seed Images

Drop image files here using the filenames listed below. On `docker compose up`,
the `minio-init` container picks them up and uploads them to the
`aether-images` bucket (taking precedence over any URL in
`seed-manifest.json`).

Subfolders must be kept exactly as below. All files must be `.jpg` (extension
matters; the seed script only looks for `.jpg`).

```
seed-images/
├── merchandise/
│   ├── zenith-shell-v1.jpg
│   ├── chronos-ti-link.jpg
│   ├── velocity-01-shoe.jpg
│   ├── zenith-diecast.jpg
│   ├── schematic-tee.jpg
│   └── hero.jpg
├── vehicles/
│   └── project-zenith.jpg
├── gallery/
│   ├── kinetic-sculpting.jpg
│   ├── the-cockpit.jpg
│   ├── v12-acoustic-test.jpg
│   ├── carbon-lite-alloys.jpg
│   ├── the-fleet-evolution.jpg
│   └── zenith-manifesto.jpg
└── routes/
    └── zenith-route.jpg
```

## How the seed script picks files

1. For every key in `seed-manifest.json` (e.g. `merchandise/zenith-shell-v1`):
   - **First** check if `seed-images/<key>.jpg` exists locally → upload it as-is.
   - **Otherwise** try downloading from the URL in the manifest.
   - **Otherwise** skip and log a warning (broken image will appear in UI).

2. Objects that already exist in MinIO are skipped on subsequent runs.

So you can drop any subset of files here — the seed picks up what's
available and falls back to URLs for the rest.

## Recommended image sizes

Anything between 800×600 and 2048×1536 looks good in the UI. Aspect ratio
isn't enforced (`object-cover` crops to fit), but landscape orientation
works best for `vehicles/`, `gallery/the-fleet-evolution`, `gallery/zenith-manifesto`
and `routes/zenith-route` (map tile).
