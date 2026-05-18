import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: "#0E1B33", soft: "#1F3864" },
        brand: {
          DEFAULT: "#1F3864",
          50:  "#EEF4FB",
          100: "#D5E8F0",
          200: "#B7D6E9",
          300: "#7FB1D7",
          400: "#4E8AC1",
          500: "#2E5797",
          600: "#274E89",
          700: "#1F3864",
          800: "#15264A",
          900: "#0E1B33",
        },
        ocean:  { DEFAULT: "#0EA5E9", deep: "#075985", surf: "#22D3EE" },
        coral:  { DEFAULT: "#F97316", soft: "#FED7AA", deep: "#9A3412" },
        moss:   { DEFAULT: "#16A34A", soft: "#BBF7D0", deep: "#14532D" },
        warn:   "#C2410C",
        ok:     "#15803D",
        bg:     { DEFAULT: "#F6F8FC", soft: "#FAFBFE" },
      },
      fontFamily: {
        sans: ["Pretendard", "Malgun Gothic", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        card:    "0 1px 2px rgba(15,23,42,0.05), 0 4px 12px rgba(15,23,42,0.04)",
        cardLg:  "0 4px 8px rgba(15,23,42,0.06), 0 12px 24px rgba(15,23,42,0.06)",
        glow:    "0 0 0 4px rgba(46,87,151,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.35s ease-out",
        "shimmer": "shimmer 1.6s linear infinite",
      },
      backgroundImage: {
        "hero-grad": "linear-gradient(135deg, #1F3864 0%, #2E5797 40%, #0EA5E9 100%)",
        "card-safe": "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)",
        "card-cong": "linear-gradient(135deg, #ECFEFF 0%, #FFFFFF 100%)",
        "card-local": "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",
        "noise": "radial-gradient(rgba(15,27,51,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
