import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ─── Font Families ─────────────────────────────── */
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },

      /* ─── CarbonCringe Color System ─────────────────── */
      colors: {
        /* shadcn tokens */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* CarbonCringe brand tokens */
        mint: {
          DEFAULT: "#39FF88",
          hover: "#52FFA0",
          glow: "rgba(57,255,136,0.25)",
          muted: "rgba(57,255,136,0.12)",
        },
        aqua: {
          DEFAULT: "#7AFCD6",
          glow: "rgba(122,252,214,0.2)",
        },
        roast: {
          DEFAULT: "#FF6B6B",
          glow: "rgba(255,107,107,0.2)",
        },
        celebrate: {
          DEFAULT: "#FFD93D",
          glow: "rgba(255,217,61,0.2)",
        },
        surface: "rgba(255,255,255,0.06)",
        "surface-hover": "rgba(255,255,255,0.09)",

        /* Chart colors */
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },

      /* ─── Border Radius ──────────────────────────────── */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        glass: "24px",
        pill: "9999px",
      },

      /* ─── Box Shadows (glass system) ─────────────────── */
      boxShadow: {
        glass: "inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)",
        "glass-hover":
          "inset 0 1px 0 rgba(255,255,255,0.2), 0 16px 48px rgba(0,0,0,0.5), 0 0 24px rgba(57,255,136,0.15)",
        "glow-mint": "0 0 20px rgba(57,255,136,0.35)",
        "glow-roast": "0 0 20px rgba(255,107,107,0.35)",
        "glow-celebrate": "0 0 20px rgba(255,217,61,0.35)",
        pill: "inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 24px rgba(0,0,0,0.35)",
      },

      /* ─── Backdrop Blur ──────────────────────────────── */
      backdropBlur: {
        glass: "24px",
        pill: "20px",
      },

      /* ─── Background Colors / Gradients ──────────────── */
      backgroundImage: {
        "mint-gradient": "linear-gradient(135deg, #39FF88 0%, #7AFCD6 100%)",
        "roast-gradient": "linear-gradient(135deg, #FF6B6B 0%, #ffaa6b 100%)",
        "celebrate-gradient":
          "linear-gradient(135deg, #FFD93D 0%, #ffaa6b 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 50% 0%, rgba(57,255,136,0.12) 0%, transparent 60%)",
      },

      /* ─── Keyframe Animations ────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "tap-flash": {
          "0%": { backgroundColor: "var(--color-primary-glow)" },
          "100%": { backgroundColor: "transparent" },
        },
        "progress-shrink": {
          from: { width: "100%" },
          to: { width: "0%" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pop-in": "pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "tap-flash": "tap-flash 0.4s ease-out forwards",
        "progress-shrink": "progress-shrink 3s linear forwards",
      },

      /* ─── Transitions ────────────────────────────────── */
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
