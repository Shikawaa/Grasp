import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

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
                // ── Grasp custom tokens ──────────────────────
                background: "#080914",
                surface: "#11121F",
                "text-main": "#F4F4F5",
                "text-muted": "#A1A1AA",

                // ── Shadcn semantic tokens (dark) ────────────
                foreground: "#F4F4F5",
                primary: {
                    DEFAULT: "#4F46E5",
                    foreground: "#FFFFFF",
                },
                card: {
                    DEFAULT: "#11121F",
                    foreground: "#F4F4F5",
                },
                popover: {
                    DEFAULT: "#11121F",
                    foreground: "#F4F4F5",
                },
                muted: {
                    DEFAULT: "#1A1B2E",
                    foreground: "#A1A1AA",
                },
                secondary: {
                    DEFAULT: "#1A1B2E",
                    foreground: "#F4F4F5",
                },
                accent: {
                    DEFAULT: "#4F46E5",
                    foreground: "#FFFFFF",
                },
                destructive: {
                    DEFAULT: "#EF4444",
                    foreground: "#FFFFFF",
                },
                border: "#1D1E35",
                input: "#1D1E35",
                ring: "#4F46E5",
            },
            borderRadius: {
                card: "12px",
                ui: "8px",
                lg: "0.75rem",
                md: "0.5rem",
                sm: "0.375rem",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
                mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
            },
        },
    },
    plugins: [tailwindcssAnimate, typography],
};

export default config;
