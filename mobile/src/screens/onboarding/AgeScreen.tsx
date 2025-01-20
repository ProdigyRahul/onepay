import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { CustomKeyboard } from '../../components/common/CustomKeyboard';

type AgeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingAge'
>;

const MIN_AGE = 18;
const MAX_AGE = 60;

const AgeScreen = () => {
  const navigation = useNavigation<AgeScreenNavigationProp>();
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setAge(prev => prev.slice(0, -1));
    } else if (age.length < 2) {
      const newAge = age + key;
      setAge(newAge);
    }
  }, [age]);

  const isValidAge = () => {
    const numAge = parseInt(age, 10);
    return !isNaN(numAge) && numAge >= MIN_AGE && numAge <= MAX_AGE;
  };

  const handleContinue = () => {
    if (isValidAge()) {
      console.log('Continuing with age:', age);
      setIsLoading(true);
      navigation.navigate('OnboardingPurpose');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>What's your age?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View 
            style={[
              styles.ageDisplay,
              !isValidAge() && age.length === 2 && styles.ageDisplayError
            ]}>
            <Text style={[
              styles.ageText,
              !age && styles.agePlaceholder
            ]}>
              {age || '18'}
            </Text>
          </View>
          {age.length > 0 && !isValidAge() && (
            <Text style={styles.errorText}>
              Please enter an age between 18 and 60
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
            <Text style={[
              styles.buttonText,
              isValidAge() && styles.buttonTextActive
            ]}>
              {isLoading ? 'Please wait...' : 'Continue'}
            </Text>
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
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: hp(2),
    textAlign: 'center',
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