import { fontSize } from '../utils/responsive';

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