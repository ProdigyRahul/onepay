import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for scaling (based on iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

// Scale factors
export const widthScale = SCREEN_WIDTH / baseWidth;
export const heightScale = SCREEN_HEIGHT / baseHeight;
export const moderateScale = (size: number, factor = 0.5) => size + (widthScale - 1) * size * factor;

// Responsive dimensions
export const wp = (widthPercent: number) => {
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

export const hp = (heightPercent: number) => {
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

// Font scaling
const scale = SCREEN_WIDTH / baseWidth;
export const normalize = (size: number) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Device info
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const statusBarHeight = StatusBar.currentHeight || 0;

// Screen breakpoints
export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  return (Math.sqrt(Math.pow(adjustedWidth, 2) + Math.pow(adjustedHeight, 2))) >= 1000;
};

// Layout helpers
export const getResponsiveWidth = (width: number) => {
  return wp((width / baseWidth) * 100);
};

export const getResponsiveHeight = (height: number) => {
  return hp((height / baseHeight) * 100);
};

// Margin and padding scales
export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(40),
};

// Safe area insets for notched devices
export const getSafeAreaInsets = () => {
  return {
    top: isIOS ? statusBarHeight : 0,
    bottom: isIOS ? 34 : 0,
    left: 0,
    right: 0,
  };
};

// Screen orientation
export const isPortrait = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width;
};

// Responsive font sizes
export const fontSizes = {
  xs: normalize(12),
  sm: normalize(14),
  md: normalize(16),
  lg: normalize(18),
  xl: normalize(20),
  xxl: normalize(24),
  xxxl: normalize(32),
}; 