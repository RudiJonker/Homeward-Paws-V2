// Homeward Paws design tokens v1.1 (2026-11-17). GENERATED from tokens/tokens.json: edit that file, not this one.
// Usage (tailwind.config.js): module.exports = { presets: [require('./tailwind.preset.js')], content: [...] };
module.exports = {
  theme: {
    extend: {
      colors: {
        "hp": {
                "primary": "#227A71",
                "primaryBright": "#2F9488",
                "primaryDark": "#185C55",
                "primaryLight": "#E3F2EF",
                "primaryMid": "#D3EAE5",
                "accent": "#E8735F",
                "accentLight": "#FCE9E4",
                "highlight": "#E9B949",
                "highlightLight": "#FBF3DC",
                "highlightOnTint": "#6B4E00",
                "background": "#FBF7F2",
                "surface": "#FFFFFF",
                "surfaceMuted": "#F5EFE7",
                "textPrimary": "#1F2D3D",
                "textSecondary": "#5E6B78",
                "textOnPrimary": "#FFFFFF",
                "textOnDarkMuted": "#C9D3DC",
                "border": "#ECE4DA",
                "overlay": "rgba(31, 45, 61, 0.48)",
                "error": "#B3363C",
                "missing": "#C8424A",
                "missingTint": "#FBE6E7",
                "missingOnTint": "#9A2A31",
                "found": "#D97820",
                "foundTint": "#FCEEDD",
                "foundOnTint": "#8F4A0C",
                "sighting": "#2F6FCE",
                "sightingTint": "#E3EDFB",
                "sightingOnTint": "#1D4E9A",
                "reunited": "#2E8456",
                "reunitedTint": "#E2F3E9",
                "reunitedOnTint": "#1D5E3B",
                "partner": "#7A5BB0",
                "partnerTint": "#EEE7F7",
                "partnerOnTint": "#55397F",
                "admin": "#3E5057",
                "adminTint": "#E6EBED",
                "adminOnTint": "#2B3A40"
        }
      },
      fontFamily: { sans: ["Nunito", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"], script: ["Dancing Script", "Segoe Script", "cursive"] },
      borderRadius: { 'hp-sm': '10px', 'hp-md': '14px', 'hp-lg': '20px', 'hp-xl': '28px', 'hp-pill': '999px' },
      boxShadow: { 'hp-card': '0 10px 30px rgba(31, 45, 61, 0.08)', 'hp-raised': '0 24px 50px rgba(31, 45, 61, 0.18)' },
      maxWidth: { 'hp': '1120px' },
    },
  },
};
