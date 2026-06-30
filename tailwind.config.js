/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "Arial", "sans-serif"],
        fellix: ["var(--font-fellix)", "Arial", "sans-serif"],
        "fellix-bold": ["var(--font-fellix-bold)", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "desktop-aging-gradient":
          "linear-gradient(90deg, #F5F4EF 6.77%, #BCA889 84.86%)",
        "mobile-aging-gradient":
          "linear-gradient(0deg, #EFE5DC, #EFE5DC),linear-gradient(180deg, #BCA889 0.04%, #F5F4EF 37.26%);",
        "desktop-hyper-gradient":
          "linear-gradient(270deg, #BCA889 0%, #F5F4EF 59.2%);",
        "mobile-hyper-gradient":
          "linear-gradient(180deg, #BCA889 0%, #F5F4EF 41.01%);",
      },
      keyframes: {
        loading: {
          "0%": { width: "0%" },
          "50%": { width: "50%" },
          "100%": { width: "100%" },
        },
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        loading: "loading 1s ease-in-out infinite",
        scroll: "scroll 100s linear infinite",
        "scroll-fast": "scroll 40s linear infinite",
        "scroll-faster": "scroll 10s linear infinite",
      },
    },
  },
  plugins: [],
};
