import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary: Indigo
                primary: {
                    DEFAULT: "#3730A3",
                    50: "#EEF2FF",
                    100: "#E0E7FF",
                    200: "#C7D2FE",
                    300: "#A5B4FC",
                    400: "#818CF8",
                    500: "#6366F1",
                    600: "#4F46E5",
                    700: "#4338CA",
                    800: "#3730A3",
                    900: "#312E81",
                    foreground: "#FFFFFF",
                },
                // Accent: Cyan
                accent: {
                    DEFAULT: "#06B6D4",
                    foreground: "#FFFFFF",
                },
                // Design tokens
                background: "#F9FAFB",
                foreground: "#111827",
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#111827",
                },
                muted: {
                    DEFAULT: "#F3F4F6",
                    foreground: "#6B7280",
                },
                border: "#E5E7EB",
                input: "#E5E7EB",
                ring: "#3730A3",
                destructive: {
                    DEFAULT: "#EF4444",
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#F3F4F6",
                    foreground: "#111827",
                },
                popover: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#111827",
                },
            },
            borderRadius: {
                lg: "0.75rem",
                md: "0.5rem",
                sm: "0.375rem",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [tailwindcssAnimate],
};

export default config;
