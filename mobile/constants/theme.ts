import { fontSizes, spacing as responsiveSpacing, normalize } from '../utils/responsive';

export const Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: '#000000',
    gray: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#5856D6',
    muted: '#C7C7CC',
  },
  spacing: {
    xs: responsiveSpacing.xs,
    sm: responsiveSpacing.sm,
    md: responsiveSpacing.md,
    lg: responsiveSpacing.lg,
    xl: responsiveSpacing.xl,
    xxl: responsiveSpacing.xxl,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 999,
  },
  typography: {
    h1: {
      fontSize: fontSizes.xxxl,
      fontWeight: 'bold',
      lineHeight: normalize(40),
    },
    h2: {
      fontSize: fontSizes.xxl,
      fontWeight: 'bold',
      lineHeight: normalize(32),
    },
    h3: {
      fontSize: fontSizes.xl,
      fontWeight: '600',
      lineHeight: normalize(28),
    },
    body: {
      fontSize: fontSizes.md,
      lineHeight: normalize(24),
    },
    caption: {
      fontSize: fontSizes.sm,
      lineHeight: normalize(20),
    },
    small: {
      fontSize: fontSizes.xs,
      lineHeight: normalize(16),
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 5.46,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.35,
      shadowRadius: 6.68,
      elevation: 8,
    },
  },
} as const; 