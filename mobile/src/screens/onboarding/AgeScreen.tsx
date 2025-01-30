import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setAge, setLoading, setError } from '../../store/slices/onboardingSlice';
import { onboardingApi } from '../../services/api/onboarding';
import { CustomKeyboard } from '../../components/common/CustomKeyboard';

type AgeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingAge'
>;

const MIN_AGE = 18;
const MAX_AGE = 60;

const AgeScreen = () => {
  const navigation = useNavigation<AgeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.onboarding);

  const [age, setAgeValue] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const isValidAge = () => {
    const numericAge = parseInt(age, 10);
    return age.length > 0 && numericAge >= MIN_AGE && numericAge <= MAX_AGE;
  };

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setAgeValue(prev => prev.slice(0, -1));
    } else if (age.length < 2) {
      const newAge = age + key;
      const numericAge = parseInt(newAge, 10);
      if (numericAge <= MAX_AGE) {
        setAgeValue(newAge);
      } else {
        // Shake animation for invalid input
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [age, shakeAnimation]);

  const handleSubmit = async () => {
    if (!isValidAge()) {
      Alert.alert('Error', `Age must be between ${MIN_AGE} and ${MAX_AGE} years`);
      return;
    }

    try {
      dispatch(setLoading(true));
      const numericAge = parseInt(age, 10);
      await onboardingApi.updateAge(numericAge);
      dispatch(setAge(numericAge));
      navigation.navigate('OnboardingPurpose');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update age';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>
            What's your <Text style={styles.titleHighlight}>age</Text>?
          </Text>
          <Text style={styles.subtitle}>
            We'll customize your financial journey based on your age group
          </Text>
        </View>

        <View style={styles.ageDisplayContainer}>
          <Animated.View style={[styles.ageDisplay, { transform: [{ translateX: shakeAnimation }] }]}>
            <Text style={styles.ageText}>{age || '--'}</Text>
            <Text style={styles.yearText}>years</Text>
          </Animated.View>
          {age && (
            <Text style={[styles.validationText, isValidAge() ? styles.validText : styles.invalidText]}>
              {isValidAge() ? '✓ Valid age' : `Age must be between ${MIN_AGE} and ${MAX_AGE} years`}
            </Text>
          )}
        </View>

        <View style={styles.keyboardContainer}>
          <CustomKeyboard onKeyPress={handleKeyPress} />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, (!isValidAge() || isLoading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isValidAge() || isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
  },
  topSection: {
    marginTop: hp(4),
    marginBottom: hp(4),
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: hp(1),
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    lineHeight: hp(2.8),
  },
  ageDisplayContainer: {
    alignItems: 'center',
    marginVertical: hp(4),
  },
  ageDisplay: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: hp(2),
    paddingVertical: hp(3),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  ageText: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: hp(1),
  },
  yearText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
  },
  validationText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    marginTop: hp(1),
  },
  validText: {
    color: COLORS.success,
  },
  invalidText: {
    color: COLORS.error,
  },
  keyboardContainer: {
    marginTop: hp(4),
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    borderRadius: hp(1),
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.medium,
  },
});

export default AgeScreen;
