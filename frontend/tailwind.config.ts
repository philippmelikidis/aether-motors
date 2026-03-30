import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ── Core brand ── */
        primary: "#00daf8",
        "primary-container": "#009fb5",
        "primary-fixed": "#a5eeff",
        "primary-fixed-dim": "#00daf8",

        /* ── Surfaces (dark hierarchy) ── */
        surface: "#121314",
        "surface-dim": "#121314",
        "surface-bright": "#38393a",
        "surface-container-lowest": "#0d0e0f",
        "surface-container-low": "#1b1c1d",
        "surface-container": "#1f2021",
        "surface-container-high": "#292a2b",
        "surface-container-highest": "#343536",
        "surface-variant": "#343536",
        "surface-tint": "#00daf8",

        /* ── On-colors ── */
        "on-surface": "#e3e2e3",
        "on-surface-variant": "#c1c6d7",
        "on-background": "#e3e2e3",
        "on-primary": "#00363f",
        "on-primary-container": "#002f37",
        "on-primary-fixed": "#001f25",
        "on-primary-fixed-variant": "#004e5a",

        /* ── Secondary ── */
        secondary: "#c4c6cc",
        "secondary-container": "#46494e",
        "secondary-fixed": "#e0e2e8",
        "secondary-fixed-dim": "#c4c6cc",
        "on-secondary": "#2d3135",
        "on-secondary-container": "#b6b8be",
        "on-secondary-fixed": "#181c20",
        "on-secondary-fixed-variant": "#44474b",

        /* ── Tertiary ── */
        tertiary: "#c6c6c9",
        "tertiary-container": "#909193",
        "tertiary-fixed": "#e2e2e5",
        "tertiary-fixed-dim": "#c6c6c9",
        "on-tertiary": "#2f3133",
        "on-tertiary-container": "#282a2c",
        "on-tertiary-fixed": "#1a1c1e",
        "on-tertiary-fixed-variant": "#454749",

        /* ── Inverse ── */
        "inverse-surface": "#e3e2e3",
        "inverse-on-surface": "#303031",
        "inverse-primary": "#006877",

        /* ── Outline ── */
        outline: "#8b90a0",
        "outline-variant": "#414755",

        /* ── Error ── */
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",

        /* ── Alias: background ── */
        background: "#121314",
      },
      fontFamily: {
        headline: ["Space Grotesk", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
