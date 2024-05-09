/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // UI Library
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",

    // Apps
    "../../apps/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
