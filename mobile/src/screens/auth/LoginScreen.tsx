import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateOTP } from '../../services/api/auth';
import { CustomKeyboard } from '../../components/common/CustomKeyboard';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { RollingText } from '../../components/common/RollingText';

const ROLLING_MESSAGES = [
  'Lend & earn upto 14%',
  'Instant money transfer',
  'Secure payments',
  'Zero transaction fees',
];

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setPhoneNumber(prev => prev.slice(0, -1));
    } else if (phoneNumber.length < 10) {
      setPhoneNumber(prev => prev + key);
    }
  }, [phoneNumber]);

  const handleContinue = async () => {
    if (phoneNumber.length !== 10) return;

    try {
      setIsLoading(true);
      const formattedPhone = `+91${phoneNumber}`;
      const response = await generateOTP(formattedPhone);
      navigation.navigate('OTP', {
        phoneNumber: formattedPhone,
        otpFromResponse: response.otp,
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send OTP'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.content}>
        <View style={styles.topSection}>
          <RollingText messages={ROLLING_MESSAGES} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Get started with</Text>
            <Text style={styles.appName}>OnePay</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countrySection}>
              <Image
                source={require('../../assets/images/flag.jpg')}
                style={styles.flag}
              />
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.separator} />
            </View>
            <Text style={[styles.phoneNumber, !phoneNumber && styles.phoneNumberPlaceholder]}>
              {phoneNumber || 'Enter mobile number'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              phoneNumber.length === 10 && styles.continueButtonActive,
            ]}
            disabled={phoneNumber.length !== 10 || isLoading}
            onPress={handleContinue}>
            <Text
              style={[
                styles.continueText,
                phoneNumber.length === 10 && styles.continueTextActive,
              ]}>
              {isLoading ? 'Sending OTP...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By clicking, I accept the{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
          </Text>

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
  titleContainer: {
    marginTop: hp(3),
  },
  title: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.black,
    marginBottom: hp(1),
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
  },
  inputSection: {
    paddingHorizontal: wp(6),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingBottom: hp(1.5),
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: wp(6),
    height: wp(4),
    marginRight: wp(2),
    borderRadius: wp(1),
  },
  countryCode: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.black,
    marginRight: wp(2),
  },
  separator: {
    width: 1,
    height: hp(3),
    backgroundColor: COLORS.border,
    marginHorizontal: wp(2),
  },
  phoneNumber: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.lg,
    color: COLORS.black,
    flex: 1,
  },
  phoneNumberPlaceholder: {
    color: COLORS.disabled,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: wp(6),
  },
  continueButton: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.surface,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    elevation: 1,
  },
  continueButtonActive: {
    backgroundColor: COLORS.primary,
    elevation: 2,
  },
  continueText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.disabled,
  },
  continueTextActive: {
    color: COLORS.white,
  },
  termsText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: hp(4),
  },
  termsLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 