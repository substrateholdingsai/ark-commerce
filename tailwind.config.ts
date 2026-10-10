import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#FD5C0D",
          600: "#F54B06",
          700: "#C23006",
          900: "#7E1D0F",
        },
        gold: {
          500: "#F59E0B",
          DEFAULT: "#D4AF37",
          300: "#FDE047",
        },
        liquid: {
          bg: "#0A0A0F",
          accent: "#FFFFFF20",
        },
        warm: {
          cream: "#FFFCF5",
          parchment: "#F9F3E9",
          brown: "#4A3A2A",
          "dark-wood": "#2A1A0A",
          "deep-red": "#8B1E1E",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        script: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-orbitron)", "monospace"],
      },
      fontSize: {
        h1: ["clamp(3rem, 5vw, 4.5rem)", { lineHeight: "1.1", fontWeight: "900" }],
        h2: ["clamp(2.5rem, 4vw, 3.75rem)", { lineHeight: "1.15", fontWeight: "700" }],
        h3: ["clamp(1.5rem, 2.5vw, 2rem)", { lineHeight: "1.2", fontWeight: "700" }],
        body: ["1rem", { lineHeight: "1.7" }],
        caption: ["0.75rem", { letterSpacing: "0.1em", textTransform: "uppercase" }],
      },
      boxShadow: {
        "liquid-glass": "0 4px 0 #888, 0 8px 16px rgba(0,0,0,0.1)",
        "liquid-glass-dark": "0 4px 0 #333, 0 8px 16px rgba(0,0,0,0.3)",
        "gold-glow": "0 0 20px rgba(212, 175, 55, 0.4)",
        "red-glow": "0 0 20px rgba(139, 30, 30, 0.3)",
        "card-hover": "0 20px 40px rgba(139, 30, 30, 0.15)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F59E0B 0%, #D4AF37 50%, #FDE047 100%)",
        "gold-divider": "linear-gradient(90deg, transparent 40%, #D4AF37 50%, transparent 60%)",
        "deep-red-gradient": "linear-gradient(135deg, #8B1E1E 0%, #5C1414 100%)",
        "liquid-glass-light": "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(200,200,200,0.8) 100%)",
        "liquid-glass-dark": "linear-gradient(180deg, rgba(30,30,30,0.9) 0%, rgba(10,10,10,0.9) 100%)",
        "paper-texture": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "paper-texture": "400px 400px",
      },
      opacity: {
        "paper": "0.06",
      },
      borderWidth: {
        "double-thin": "1px",
      },
      transitionDuration: {
        "slow": "500ms",
      },
      keyframes: {
        "shine-slide": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "shine-slide": "shine-slide 800ms ease-out",
        "fade-in-up": "fade-in-up 600ms ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;