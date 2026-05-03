export const colors = {
  // Kept from the original web design system where it does not fight Toss UI.
  legacyMainPrimary: '#ff9078',
  legacyMainPrimaryText: '#f28c76',
  legacyMainSecondary: '#1f2329',
  legacyBackgroundOrange: '#fdede8',
  legacyBackgroundGrey: '#f3f6fb',
  legacyGrey20: '#f0f2f6',
  legacyGrey40: '#dbe5ec',
  legacyGrey60: '#c3c9d3',
  legacyGrey80: '#8d939d',
  legacyGrey100: '#1f2329',

  background: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f3f6fb',
  surfacePressed: '#f0f2f6',
  textPrimary: '#1f2329',
  textBody: '#333d4b',
  textSecondary: '#6b7684',
  textTertiary: '#8d939d',
  textLabel: '#4e5968',
  border: '#e5e8eb',
  borderStrong: '#d1d6db',
  brand: '#ff9078',
  brandText: '#f28c76',
  brandSoft: '#fdede8',
  success: '#20a05a',
  error: '#fe2929',
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

export const componentMap = {
  primaryButton: {
    legacy: 'PrimaryButton(theme: focus | hover | white)',
    toss: '@toss/tds-react-native Button with display/style props',
  },
  card: {
    legacy: 'atoms/containers/Card',
    toss: 'components/Card backed by 8px app radius and TDS text',
  },
  badge: {
    legacy: 'atoms/display/Badge',
    toss: 'components/Pill for status-only labels',
  },
  progress: {
    legacy: 'molecules/ProgressBar rainbow milestones',
    toss: 'single-brand progress until v1 needs milestone color semantics',
  },
  letterCard: {
    legacy: 'molecules/cards/LetterCard',
    toss: 'Card + Txt composition in letters and letter-detail screens',
  },
} as const;
