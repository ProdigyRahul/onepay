import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (you can adjust these based on your design)
const baseWidth = 375; // Standard iPhone width
const baseHeight = 812; // Standard iPhone height

// Scaling factors
const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

// Responsive width
export const wp = (widthPercent: number) => {
  return SCREEN_WIDTH * (widthPercent / 100);
};

// Responsive height
export const hp = (heightPercent: number) => {
  return SCREEN_HEIGHT * (heightPercent / 100);
};

// Scale font size
export const fontSize = (size: number) => {
  return Math.round(size * widthScale);
};

// Scale spacing (margin, padding, etc.)
export const spacing = (size: number) => {
  return Math.round(size * widthScale);
};

export const metrics = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  widthScale,
  heightScale,
};

// Common responsive values
export const commonStyles = {
  container: {
    flex: 1,
    width: wp(100),
  },
  contentContainer: {
    paddingHorizontal: spacing(16),
  },
  // Add more common styles as needed
};
