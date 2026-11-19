// Homeward Paws design tokens v1.1 (2026-11-17). GENERATED from tokens/tokens.json: edit that file, not this one.
// Drop-in for the app's src/theme/. JavaScript only (no TypeScript).

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold'
};

export const typography = {
  display: { fontFamily: fonts.extraBold, fontSize: 28, lineHeight: 34 },
  screenTitle: { fontFamily: fonts.extraBold, fontSize: 22, lineHeight: 28 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
  status: { fontFamily: fonts.extraBold, fontSize: 11, lineHeight: 14, textTransform: 'uppercase', letterSpacing: 0.5 }
};
