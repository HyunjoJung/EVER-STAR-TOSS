export const colors = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f9fafb',
  surfacePressed: '#f2f4f6',
  textPrimary: '#191f28',
  textBody: '#333d4b',
  textSecondary: '#6b7684',
  textTertiary: '#8b95a1',
  textLabel: '#4e5968',
  border: '#e5e8eb',
  borderStrong: '#d1d6db',
  brand: '#eb7f72',
  brandSoft: '#fff1ee',
  success: '#20a05a',
  white: '#ffffff',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 36,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  pill: 999,
} as const;

export const lineHeights = {
  caption: 19,
  body: 22,
  readable: 24,
} as const;

export const layout = {
  screenPadding: spacing.xl,
  footerPadding: spacing.xl,
  cardGap: spacing.md,
} as const;
