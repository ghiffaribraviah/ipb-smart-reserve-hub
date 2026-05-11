import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f9f9f7",
          dim: "#dadad8",
          bright: "#f9f9f7",
          "container-lowest": "#ffffff",
          "container-low": "#f4f4f2",
          container: "#eeeeec",
          "container-high": "#e8e8e6",
          "container-highest": "#e2e3e1",
          variant: "#e2e3e1",
          tint: "#466463",
        },
        "on-surface": {
          DEFAULT: "#1a1c1b",
          variant: "#414848",
        },
        inverse: {
          surface: "#2f3130",
          "on-surface": "#f1f1ef",
          primary: "#adcdcc",
        },
        outline: {
          DEFAULT: "#717878",
          variant: "#c1c8c7",
        },
        primary: {
          DEFAULT: "#001919",
          on: "#ffffff",
          container: "#0f2e2e",
          "on-container": "#789696",
          fixed: "#c8e9e8",
          "fixed-dim": "#adcdcc",
          "on-fixed": "#002020",
          "on-fixed-variant": "#2e4c4c",
        },
        secondary: {
          DEFAULT: "#006c47",
          on: "#ffffff",
          container: "#8bf5bd",
          "on-container": "#00714a",
          fixed: "#8ef7c0",
          "fixed-dim": "#71dba5",
          "on-fixed": "#002112",
          "on-fixed-variant": "#005234",
        },
        tertiary: {
          DEFAULT: "#765b00",
          on: "#ffffff",
          container: "#d1a522",
          "on-container": "#503d00",
          fixed: "#ffdf94",
          "fixed-dim": "#efc13e",
          "on-fixed": "#241a00",
          "on-fixed-variant": "#594400",
        },
        error: {
          DEFAULT: "#ba1a1a",
          on: "#ffffff",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        background: {
          DEFAULT: "#f9f9f7",
          on: "#1a1c1b",
        },
      },
      fontFamily: {
        sans: ["Satoshi", "Arial", "sans-serif"],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0" }],
        h2: ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["24px", { lineHeight: "1.4", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-bold": ["14px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0.05em" }],
        "label-sm": ["12px", { lineHeight: "1.2", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "48px",
        gutter: "24px",
      },
      maxWidth: {
        container: "1280px",
      },
      boxShadow: {
        ambient: "0 18px 48px rgba(15, 46, 46, 0.08)",
        control: "0 8px 24px rgba(15, 46, 46, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
