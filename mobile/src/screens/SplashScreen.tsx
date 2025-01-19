import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../theme/colors';
import { fontSize, wp } from '../utils/responsive';

export const SplashScreen = () => {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    // Run animations in sequence
    Animated.sequence([
      // First fade in and slide from left
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <Text style={styles.textOne}>One</Text>
        <Text style={styles.textPay}>Pay</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textOne: {
    fontSize: fontSize(48),
    fontWeight: '300', // Light weight for premium feel
    color: COLORS.text.primary,
    letterSpacing: 2,
  },
  textPay: {
    fontSize: fontSize(48),
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
}); 