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

  const handleContinue = async () => {
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
          <Text style={styles.title}>What's your <Text style={styles.titleHighlight}>age</Text>?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your financial recommendations
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Animated.View 
            style={[
              styles.ageDisplay,
              !isValidAge() && age.length === 2 && styles.ageDisplayError,
              { transform: [{ translateX: shakeAnimation }] }
            ]}>
            <Text style={[
              styles.ageText,
              !age && styles.agePlaceholder
            ]}>
              {age || '18'}
            </Text>
          </Animated.View>
          {age.length > 0 && !isValidAge() && (
            <Text style={styles.errorText}>
              Please enter an age between {MIN_AGE} and {MAX_AGE}
            </Text>
          )}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.button,
              isValidAge() && styles.buttonActive
            ]}
            onPress={handleContinue}
            disabled={!isValidAge() || isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={[
                styles.buttonText,
                isValidAge() && styles.buttonTextActive
              ]}>
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <CustomKeyboard onKeyPress={handleKeyPress} />
        </View>
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
    paddingTop: StatusBar.currentHeight || 0,
  },
  topSection: {
    paddingTop: hp(4),
    paddingHorizontal: wp(6),
    marginBottom: hp(6),
  },
  title: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.black,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  titleHighlight: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: hp(3),
  },
  inputSection: {
    paddingHorizontal: wp(6),
    alignItems: 'center',
  },
  ageDisplay: {
    width: wp(30),
    height: hp(10),
    backgroundColor: COLORS.surface,
    borderRadius: wp(4),
    borderWidth: 2,
    borderColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    elevation: 2,
  },
  ageDisplayError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFE5E5',
  },
  ageText: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  agePlaceholder: {
    color: COLORS.textSecondary,
    opacity: 0.5,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: '#FF3B30',
    marginTop: hp(1),
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
    marginTop: 'auto',
  },
  button: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.surface,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    marginBottom: hp(4),
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    elevation: 2,
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.disabled,
  },
  buttonTextActive: {
    color: COLORS.white,
  },
});

export default AgeScreen; 