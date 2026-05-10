Action: file_editor create /app/frontend/tailwind.config.js --file-text "/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: [\"class\"],
  content: [\"./src/**/*.{js,jsx,ts,tsx}\"],
  theme: {
    container: {
      center: true,
      padding: \"2rem\",
      screens: { \"2xl\": \"1400px\" },
    },
    extend: {
      fontFamily: {
        display: [\"'Cabinet Grotesk'\", \"'Manrope'\", \"sans-serif\"],
        sans: [\"'Manrope'\", \"system-ui\", \"sans-serif\"],
        mono: [\"'JetBrains Mono'\", \"ui-monospace\", \"monospace\"],
      },
      colors: {
        border: \"hsl(var(--border))\",
        input: \"hsl(var(--input))\",
        ring: \"hsl(var(--ring))\",
        background: \"hsl(var(--background))\",
        foreground: \"hsl(var(--foreground))\",
        primary: {
          DEFAULT: \"hsl(var(--primary))\",
          foreground: \"hsl(var(--primary-foreground))\",
        },
        secondary: {
          DEFAULT: \"hsl(var(--secondary))\",
          foreground: \"hsl(var(--secondary-foreground))\",
        },
        destructive: {
          DEFAULT: \"hsl(var(--destructive))\",
          foreground: \"hsl(var(--destructive-foreground))\",
        },
        muted: {
          DEFAULT: \"hsl(var(--muted))\",
          foreground: \"hsl(var(--muted-foreground))\",
        },
        accent: {
          DEFAULT: \"hsl(var(--accent))\",
          foreground: \"hsl(var(--accent-foreground))\",
        },
        popover: {
          DEFAULT: \"hsl(var(--popover))\",
          foreground: \"hsl(var(--popover-foreground))\",
        },
        card: {
          DEFAULT: \"hsl(var(--card))\",
          foreground: \"hsl(var(--card-foreground))\",
        },
      },
      borderRadius: {
        lg: \"var(--radius)\",
        md: \"calc(var(--radius) - 2px)\",
        sm: \"calc(var(--radius) - 4px)\",
      },
      keyframes: {
        \"accordion-down\": { from: { height: 0 }, to: { height: \"var(--radix-accordion-content-height)\" } },
        \"accordion-up\": { from: { height: \"var(--radix-accordion-content-height)\" }, to: { height: 0 } },
        aurora: {
          \"0%,100%\": { transform: \"translate3d(0,0,0) scale(1)\" },
          \"50%\": { transform: \"translate3d(2%,-3%,0) scale(1.08)\" },
        },
        shimmer: { \"0%\": { backgroundPosition: \"-200% 0\" }, \"100%\": { backgroundPosition: \"200% 0\" } },
        pulseGlow: {
          \"0%,100%\": { boxShadow: \"0 0 0 0 rgba(245,158,11,0.45)\" },
          \"50%\": { boxShadow: \"0 0 0 16px rgba(245,158,11,0)\" },
        },
      },
      animation: {
        \"accordion-down\": \"accordion-down 0.2s ease-out\",
        \"accordion-up\": \"accordion-up 0.2s ease-out\",
        aurora: \"aurora 14s ease-in-out infinite\",
        shimmer: \"shimmer 2.4s linear infinite\",
        pulseGlow: \"pulseGlow 2s ease-in-out infinite\",
      },
    },
  },
  plugins: [require(\"tailwindcss-animate\")],
};
"
Observation: Overwrite successful: /app/frontend/tailwind.config.js