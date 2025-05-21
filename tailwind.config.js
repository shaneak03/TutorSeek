/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins_400Regular"],
      },
      colors: {
        "primary-700": "#6366F1",
        "neutral-900": "111827",
        "neutral-300": "CCCCCC",
        "neutral-200": "F2F2F2",
        "neutral-100": "F9FAFB",
      },
    },
  },
  plugins: [],
};
