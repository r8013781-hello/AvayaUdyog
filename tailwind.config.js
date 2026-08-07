import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        /* Paper — the dominant surface. Off-white, not clinical white, so
           the large open sections don't glare next to the sage/gold palette. */
        canvas: {
          DEFAULT: "#fbfbf7",
          soft: "#fbfdfb",
          tint: "#f3f9f4",
        },

        /* Sage — the brand green, from mist to forest. */
        sage: {
          50: "#f4faf5",
          100: "#e8f3ea",
          200: "#d3e8d7",
          300: "#aed4b6",
          400: "#82b891",
          500: "#5b9a6d",
          600: "#427d54",
          700: "#356443",
          800: "#2b4f36",
          900: "#1f3a28",
          950: "#14271b",
        },

        /* Gold — accent only. Hairlines, numerals, ornaments. */
        gold: {
          DEFAULT: "#c9a86b",
          light: "#e5d2a6",
          soft: "#f6efdf",
          deep: "#a3803f",
        },

        /* Ink — the type ramp. */
        ink: {
          DEFAULT: "#152219",
          soft: "#3a4d41",
          muted: "#6b7f72",
          faint: "#9caba1",
        },

        /* Hairlines. */
        line: {
          DEFAULT: "#e6f0e8",
          strong: "#d2e3d6",
          gold: "#ecdfc4",
        },
      },

      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },

      fontSize: {
        micro: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.18em" }],
      },

      letterSpacing: {
        label: "0.22em",
        wider2: "0.32em",
      },

      borderRadius: {
        xl2: "1.25rem",
        "3xl2": "1.75rem",
        card: "1.5rem",
      },

      boxShadow: {
        /* All shadows are green-tinted so nothing reads as grey sludge. */
        hair: "0 1px 2px rgba(31, 58, 40, 0.04)",
        soft: "0 2px 8px -2px rgba(31, 58, 40, 0.06), 0 12px 32px -12px rgba(31, 58, 40, 0.10)",
        lift: "0 4px 12px -4px rgba(31, 58, 40, 0.08), 0 24px 56px -20px rgba(31, 58, 40, 0.16)",
        float:
          "0 8px 20px -8px rgba(31, 58, 40, 0.12), 0 40px 80px -32px rgba(31, 58, 40, 0.22)",
        gold: "0 10px 30px -12px rgba(163, 128, 63, 0.30)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.7)",
      },

      backgroundImage: {
        "gold-hair":
          "linear-gradient(90deg, transparent, #c9a86b 35%, #e5d2a6 50%, #c9a86b 65%, transparent)",
        "gold-fill":
          "linear-gradient(135deg, #a3803f 0%, #c9a86b 40%, #eadcb8 52%, #c9a86b 64%, #a3803f 100%)",
        "sage-fill": "linear-gradient(135deg, #2b4f36 0%, #427d54 55%, #2b4f36 100%)",
        "mist": "linear-gradient(180deg, #ffffff 0%, #f4faf5 100%)",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        crisp: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      maxWidth: {
        /* Narrower than a typical marketing shell on purpose — a slim,
           linear column reads calmer than an edge-to-edge sprawl. */
        shell: "72rem",
        prose2: "36rem",
      },
    },
  },
  plugins: [typography],
};
