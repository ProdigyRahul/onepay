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
import { setIncome, setLoading, setError } from '../../store/slices/onboardingSlice';
import { onboardingApi, IncomeRange, SpendingHabit, UserGoal } from '../../services/api/onboarding';
import axios from 'axios';

type IncomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingIncome'
>;

interface IncomeOption {
  id: IncomeRange;
  title: string;
  description: string;
  icon: string;
}

const formatIncomeRange = (range: IncomeRange): string => {
  switch (range) {
    case IncomeRange.RANGE_0_25000:
      return '₹0 - ₹25,000';
    case IncomeRange.RANGE_25000_100000:
      return '₹25,000 - ₹1,00,000';
    case IncomeRange.RANGE_100000_300000:
      return '₹1,00,000 - ₹3,00,000';
    case IncomeRange.RANGE_300000_PLUS:
      return '₹3,00,000+';
    default:
      return '';
  }
};

const incomeOptions: IncomeOption[] = [
  {
    id: IncomeRange.RANGE_0_25000,
    title: formatIncomeRange(IncomeRange.RANGE_0_25000),
    description: 'Entry level income',
    icon: 'currency-inr',
  },
  {
    id: IncomeRange.RANGE_25000_100000,
    title: formatIncomeRange(IncomeRange.RANGE_25000_100000),
    description: 'Mid level income',
    icon: 'currency-inr',
  },
  {
    id: IncomeRange.RANGE_100000_300000,
    title: formatIncomeRange(IncomeRange.RANGE_100000_300000),
    description: 'High income',
    icon: 'currency-inr',
  },
  {
    id: IncomeRange.RANGE_300000_PLUS,
    title: formatIncomeRange(IncomeRange.RANGE_300000_PLUS),
    description: 'Premium income',
    icon: 'currency-inr',
  },
];

const IncomeScreen = () => {
  const navigation = useNavigation<IncomeScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.onboarding);

  const [selectedIncome, setSelectedIncome] = useState<IncomeRange | null>(null);

  const handleIncomeSelect = (income: IncomeRange) => {
    setSelectedIncome(income);
  };

  const handleSubmit = async () => {
    if (!selectedIncome) {
      Alert.alert('Error', 'Please select your income range');
      return;
    }

    try {
      dispatch(setLoading(true));
      console.log('Submitting income range:', {
        selectedIncome,
        type: typeof selectedIncome,
        stringified: JSON.stringify({ incomeRange: selectedIncome })
      });
      
      const response = await onboardingApi.updateIncomeRange(selectedIncome);
      console.log('Income range update response:', response);
      
      dispatch(setIncome(selectedIncome));
      navigation.navigate('OnboardingSpending');
    } catch (err) {
      console.error('Income range update error:', err);
      if (axios.isAxiosError(err)) {
        console.error('Network Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            data: err.config?.data,
            headers: err.config?.headers
          }
        });
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to update income range';
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
          <Text style={styles.title}>What's your <Text style={styles.titleHighlight}>monthly income</Text>?</Text>
          <Text style={styles.subtitle}>
            This helps us provide personalized financial recommendations and budgeting insights
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {incomeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedIncome === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleIncomeSelect(option.id)}>
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
              {selectedIncome === option.id && (
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
              selectedIncome && styles.buttonActive
            ]}
            onPress={handleSubmit}
            disabled={!selectedIncome || isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={[
                styles.buttonText,
                selectedIncome && styles.buttonTextActive
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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

export default IncomeScreen; 