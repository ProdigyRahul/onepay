import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
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
import { setPurpose, setLoading, setError } from '../../store/slices/onboardingSlice';
import { onboardingApi, UserGoal } from '../../services/api/onboarding';

type PurposeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingPurpose'
>;

interface PurposeOption {
  id: UserGoal;
  title: string;
  description: string;
  icon: string;
}

const purposeOptions: PurposeOption[] = [
  {
    id: UserGoal.EVERYDAY_PAYMENTS,
    title: 'Everyday payments',
    description: 'UPI, Credit Card, Recharges, Bills',
    icon: 'bank-transfer',
  },
  {
    id: UserGoal.LOANS,
    title: 'Loans',
    description: 'ZIP-EMI, Credit Score',
    icon: 'cash-fast',
  },
  {
    id: UserGoal.INVESTMENTS,
    title: 'Invest & grow my money',
    description: 'FD, Xtra, Gold, Mutual Funds',
    icon: 'trending-up',
  },
  {
    id: UserGoal.TRACK_EXPENSES,
    title: 'Track my bank spends',
    description: 'with OnePay',
    icon: 'chart-timeline-variant',
  },
];

const PurposeScreen = () => {
  const navigation = useNavigation<PurposeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.onboarding);

  const [selectedPurpose, setSelectedPurpose] = useState<UserGoal | null>(null);

  const handlePurposeSelect = (purpose: UserGoal) => {
    setSelectedPurpose(purpose);
  };

  const handleSubmit = async () => {
    if (!selectedPurpose) {
      Alert.alert('Error', 'Please select your purpose');
      return;
    }

    try {
      dispatch(setLoading(true));
      await onboardingApi.updatePrimaryGoal(selectedPurpose);
      dispatch(setPurpose(selectedPurpose));
      navigation.navigate('OnboardingIncome');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update purpose';
      dispatch(setError(errorMessage));
      Alert.alert('Error', errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Text style={styles.title}>What brings you to <Text style={styles.titleHighlight}>OnePay</Text>?</Text>
          <Text style={styles.subtitle}>
            Select your primary financial goal, and we'll customize your experience accordingly
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {purposeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedPurpose === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handlePurposeSelect(option.id)}>
              <View style={styles.optionContent}>
                <View style={styles.optionIconContainer}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={wp(6)}
                    color={COLORS.primary}
                  />
                </View>
                <View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
              {selectedPurpose === option.id && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={wp(6)}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.button,
              selectedPurpose && styles.buttonActive,
            ]}
            onPress={handleSubmit}
            disabled={!selectedPurpose || isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={[
                styles.buttonText,
                selectedPurpose && styles.buttonTextActive,
              ]}>
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  titleHighlight: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: hp(3),
  },
  optionsContainer: {
    paddingHorizontal: wp(6),
    gap: hp(2),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp(4),
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  optionIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  optionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    marginBottom: hp(0.5),
  },
  optionDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    marginTop: hp(4),
  },
  button: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.surface,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
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

export default PurposeScreen;
