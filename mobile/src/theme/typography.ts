import { fontSize } from '../utils/responsive';
import { Platform } from 'react-native';

export const FONTS = {
  regular: 'Roboto-Regular',
  bold: 'Roboto-Bold',
  light: 'Roboto-Light',
  medium: 'Roboto-Medium',
};

export const FONT_SIZES = {
  xs: fontSize(12),
  sm: fontSize(14),
  md: fontSize(16),
  lg: fontSize(18),
  xl: fontSize(20),
  xxl: fontSize(24),
  xxxl: fontSize(32),
  splash: fontSize(48),
} as const;

export const LINE_HEIGHTS = {
  xs: fontSize(18),
  sm: fontSize(20),
  md: fontSize(24),
  lg: fontSize(28),
  xl: fontSize(32),
  xxl: fontSize(36),
  xxxl: fontSize(44),
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
} as const;
