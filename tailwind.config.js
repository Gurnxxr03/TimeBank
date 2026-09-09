/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#28695c",
        "primary-container": "#98d8c8",
        "on-primary": "#ffffff",
        "on-primary-container": "#1d6053",
        "primary-fixed": "#afefdf",
        "primary-fixed-dim": "#93d3c3",
        "on-primary-fixed": "#00201a",
        "on-primary-fixed-variant": "#045044",
        "inverse-primary": "#93d3c3",
        
        "secondary": "#52643d",
        "secondary-container": "#d5eab8",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#586a43",
        "secondary-fixed": "#d5eab8",
        "secondary-fixed-dim": "#b9cd9e",
        "on-secondary-fixed": "#111f02",
        "on-secondary-fixed-variant": "#3b4c28",
        
        "tertiary": "#84523b",
        "tertiary-container": "#ffbca0",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#7a4934",
        "tertiary-fixed": "#ffdbcd",
        "tertiary-fixed-dim": "#fab79c",
        "on-tertiary-fixed": "#341102",
        "on-tertiary-fixed-variant": "#693b26",

        "surface": "#f8faf7",
        "surface-bright": "#f8faf7",
        "surface-dim": "#d8dbd8",
        "surface-variant": "#e1e3e1",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f2",
        "surface-container": "#eceeec",
        "surface-container-high": "#e6e9e6",
        "surface-container-highest": "#e1e3e1",
        "surface-tint": "#28695c",
        
        "on-surface": "#191c1b",
        "on-surface-variant": "#3f4946",
        "inverse-surface": "#2e3130",
        "inverse-on-surface": "#eff1ef",
        "background": "#f8faf7",
        "on-background": "#191c1b",
        
        "outline": "#6f7976",
        "outline-variant": "#bfc9c5",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "logo-sage": "#87A96B",
        "pastel-mint": "#F0FFF0",
        "pastel-peach": "#FFDAB9",
        "pastel-lavender": "#E6E6FA",
        "glass-surface": "rgba(255, 255, 255, 0.45)",
        "glass-border": "rgba(255, 255, 255, 0.65)",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "20px",
        "container-max": "1280px",
        "unit": "8px",
        "gutter": "24px",
        "margin-desktop": "48px"
      },
      fontFamily: {
        "display-lg": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "label-sm": ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
