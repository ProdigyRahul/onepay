import React, { useEffect, useState } from 'react';
import { Text, Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';

interface RollingTextProps {
  messages: string[];
  interval?: number;
}

export const RollingText: React.FC<RollingTextProps> = ({
  messages,
  interval = 1500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  useEffect(() => {
    const animate = () => {
      translateY.setValue(0);
      opacity.setValue(1);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -hp(4),
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % messages.length);
      });
    };

    const intervalId = setInterval(animate, interval);
    return () => clearInterval(intervalId);
  }, [messages, interval, nextIndex]);

  const getNextMessage = () => {
    return messages[nextIndex];
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textWrapper,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}>
        <Text style={styles.text}>{messages[currentIndex]}</Text>
        <Text style={[styles.text, styles.nextText]}>{getNextMessage()}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(3),
    overflow: 'hidden',
  },
  textWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: '#666666',
    textAlign: 'left',
    letterSpacing: 0.2,
  },
  nextText: {
    position: 'absolute',
    top: hp(4),
    left: 0,
  },
}); 