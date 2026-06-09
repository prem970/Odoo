/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#714B67", // Deep Plum
          foreground: "#FFFFFF",
          hover: "#5a3b52", // Darker shade
          light: "#9A7E92",
        },
        secondary: {
          DEFAULT: "#475569", // Slate Gray
          foreground: "#FFFFFF",
        },
        accent: {
          mustard: "#E3B341", // Mustard Yellow
          sky: "#38BDF8", // Sky Blue
          teal: "#14B8A6", // Teal / Seafoam
        },
        neutral: {
          50: "#F9FAFB", // Off-white
          100: "#F3F4F6",
          200: "#E5E7EB",
          800: "#1F2937",
          900: "#111827",
        },
        module: {
          crm: "#3B82F6", // Blue
          inventory: "#F97316", // Orange
          finance: "#8B5CF6", // Purple
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        handwriting: ["'Architects Daughter'", "cursive"],
        cursive: ["'Patrick Hand'", "cursive"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "draw": "draw 1s ease-out forwards",
        "lift": "lift 0.3s ease-out forwards",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up-delay-1": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards",
        "fade-up-delay-2": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
        "fade-up-delay-3": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "draw-underline": "drawUnderline 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "rotate-slow": "rotateSlow 20s linear infinite",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        draw: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        lift: {
          "0%": { transform: "translateY(0)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
          "100%": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(113, 75, 103, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(113, 75, 103, 0.6)" },
        },
        drawUnderline: {
          "0%": { width: "0%", left: "50%" },
          "100%": { width: "100%", left: "0%" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        rotateSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      }
    },
  },
  plugins: [],
}

