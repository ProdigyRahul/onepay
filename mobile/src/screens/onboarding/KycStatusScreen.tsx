import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLoading, setError } from '../../store/slices/onboardingSlice';
import { kycApi } from '../../services/api/kyc';

type KycStatusScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingKycStatus'
>;

const KycStatusScreen = () => {
  const navigation = useNavigation<KycStatusScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.onboarding);
  const [kycStatus, setKycStatus] = React.useState<'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | null>(null);

  const checkKycStatus = React.useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await kycApi.getKycStatus();

      if (!response.success) {
        throw new Error(response.error || 'Failed to get KYC status');
      }

      setKycStatus(response.data.status);

      if (response.data.status === 'VERIFIED') {
        // Small delay to show success message
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get KYC status';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, navigation]);

  useEffect(() => {
    checkKycStatus();
  }, [checkKycStatus]);

  const renderStatus = () => {
    switch (kycStatus) {
      case 'PENDING_VERIFICATION':
        return (
          <>
            <MaterialCommunityIcons
              name="clock-outline"
              size={wp(20)}
              color={COLORS.warning}
            />
            <Text style={styles.title}>KYC Verification Pending</Text>
            <Text style={styles.subtitle}>
              We are reviewing your documents. This usually takes 24-48 hours.
            </Text>
          </>
        );
      case 'VERIFIED':
        return (
          <>
            <MaterialCommunityIcons
              name="check-circle"
              size={wp(20)}
              color={COLORS.success}
            />
            <Text style={styles.title}>KYC Verified Successfully</Text>
            <Text style={styles.subtitle}>
              Your KYC verification is complete. Redirecting to home...
            </Text>
          </>
        );
      case 'REJECTED':
        return (
          <>
            <MaterialCommunityIcons
              name="close-circle"
              size={wp(20)}
              color={COLORS.error}
            />
            <Text style={styles.title}>KYC Verification Failed</Text>
            <Text style={styles.subtitle}>
              Your KYC verification was rejected. Please upload a clear photo of your PAN card.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('OnboardingKycDocument')}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return (
          <ActivityIndicator size="large" color={COLORS.primary} />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          renderStatus()
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    marginTop: hp(3),
    marginBottom: hp(2),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: hp(2.8),
  },
  button: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
});

export default KycStatusScreen;
