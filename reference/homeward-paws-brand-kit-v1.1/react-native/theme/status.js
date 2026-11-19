// Homeward Paws design tokens v1.1 (2026-11-17). GENERATED from tokens/tokens.json: edit that file, not this one.
// Drop-in for the app's src/theme/. JavaScript only (no TypeScript).

import { colors } from './colors';

// Status = colour + icon + label, always together. Icons are MaterialCommunityIcons names.
export const status = {
  missing: { base: colors.missing, tint: colors.missingTint, onTint: colors.missingOnTint, label: 'MISSING', icon: 'alert-circle' },
  found: { base: colors.found, tint: colors.foundTint, onTint: colors.foundOnTint, label: 'FOUND', icon: 'shield-home' },
  sighting: { base: colors.sighting, tint: colors.sightingTint, onTint: colors.sightingOnTint, label: 'SIGHTING', icon: 'eye' },
  reunited: { base: colors.reunited, tint: colors.reunitedTint, onTint: colors.reunitedOnTint, label: 'REUNITED', icon: 'home-heart' },
  partner: { base: colors.partner, tint: colors.partnerTint, onTint: colors.partnerOnTint, label: 'VERIFIED PARTNER', icon: 'check-decagram' },
  admin: { base: colors.admin, tint: colors.adminTint, onTint: colors.adminOnTint, label: '(per context, e.g. ARCHIVED)', icon: '(per context)' },
  safe: { base: colors.reunited, tint: colors.reunitedTint, onTint: colors.reunitedOnTint, label: 'SAFE', icon: 'home-heart' }
};
