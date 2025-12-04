/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "media", // Respektuje nastavení systému (Světle/Tmavě)
    content: [
      "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
      extend: {
        colors: {
          // FlowLint / Replikanti Brand Colors (Pink/Red spectrum)
          brand: {
            50: '#fff1f2',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#fb7185',
            500: '#f43f5e', // Main Brand Color (Rose-500)
            600: '#e11d48', // Hover state
            700: '#be123c',
            800: '#9f1239',
            900: '#881337',
            950: '#4c0519',
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }