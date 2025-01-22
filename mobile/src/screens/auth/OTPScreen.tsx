import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { verifyOTP } from '../../services/api/auth';
import { CustomKeyboard } from '../../components/common/CustomKeyboard';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setCredentials, setLoading, setError } from '../../store/slices/authSlice';
import { onboardingApi } from '../../services/api/onboarding';

type OTPScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTP'>;
type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTP'>;

const OTP_LENGTH = 6;

const OTPScreen = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setOtp(prev => prev.slice(0, -1));
    } else if (otp.length < OTP_LENGTH) {
      setOtp(prev => prev + key);
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await verifyOTP({ phoneNumber, code: otp });

      if (response.success && response.data) {
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token,
        }));

        // Check onboarding status
        const statusResponse = await onboardingApi.getOnboardingStatus();
        const status = statusResponse.data;

        if (status.onboardingComplete) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          // Navigate to the appropriate onboarding screen
          if (!status.profileCompleted) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'NotificationsPermission' }],
            });
          } else if (!status.ageVerified) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingAge' }],
            });
          } else if (!status.primaryGoalSet) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingPurpose' }],
            });
          } else if (!status.incomeRangeSet) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingIncome' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingSpending' }],
            });
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const renderOTPBoxes = () => {
    const boxes = [];
    for (let i = 0; i < OTP_LENGTH; i++) {
      boxes.push(
        <View
          key={i}
          style={[
            styles.otpInput,
            otp[i] && styles.otpInputActive,
          ]}>
          <Text style={styles.otpDigit}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {phoneNumber}
          </Text>
        </View>

        <View style={styles.otpSection}>
          <View style={styles.otpContainer}>
            {renderOTPBoxes()}
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {timer > 0 ? `Resend code in ${timer}s` : 'Didn\'t receive the code?'}
            </Text>
            {timer === 0 && (
              <TouchableOpacity style={styles.resendButton}>
                <Text style={styles.resendButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
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
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: hp(3),
  },
  otpSection: {
    paddingHorizontal: wp(6),
    marginTop: hp(2),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp(4),
  },
  otpInput: {
    width: wp(12),
    height: wp(14),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  otpInputActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  otpDigit: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xl,
    color: COLORS.black,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  timerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: hp(1),
  },
  resendButton: {
    padding: hp(1),
  },
  resendButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: wp(6),
  },
  button: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
    elevation: 1,
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
});

export default OTPScreen;
