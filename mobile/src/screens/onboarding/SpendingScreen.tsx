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
import { setSpending, setLoading, setError } from '../../store/slices/onboardingSlice';
import { onboardingApi, SpendingHabit } from '../../services/api/onboarding';

type SpendingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingSpending'
>;

interface SpendingOption {
  id: SpendingHabit;
  title: string;
  description: string;
  icon: string;
}

const spendingOptions: SpendingOption[] = [
  {
    id: SpendingHabit.SPEND_ALL,
    title: 'Big Spender',
    description: 'I spend most of my income on lifestyle and purchases',
    icon: 'shopping',
  },
  {
    id: SpendingHabit.SPEND_SOMETIMES,
    title: 'Balanced Spender',
    description: 'I maintain a balance between spending and saving',
    icon: 'scale-balance',
  },
  {
    id: SpendingHabit.SAVE_MOST,
    title: 'Smart Saver',
    description: 'I prefer saving and investing over spending',
    icon: 'piggy-bank',
  },
  {
    id: SpendingHabit.SPEND_NONE,
    title: 'Super Saver',
    description: 'I save almost everything and spend minimally',
    icon: 'bank',
  },
];

const SpendingScreen = () => {
  const navigation = useNavigation<SpendingScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.onboarding);

  const [selectedSpending, setSelectedSpending] = useState<SpendingHabit | null>(null);

  const handleSpendingSelect = (spending: SpendingHabit) => {
    setSelectedSpending(spending);
  };

  const handleSubmit = async () => {
    if (!selectedSpending) {
      Alert.alert('Error', 'Please select your spending habit');
      return;
    }

    try {
      dispatch(setLoading(true));
      console.log('Updating spending habits...');
      
      const response = await onboardingApi.updateSpendingHabits({
        spendingHabit: selectedSpending,
        targetSpendingPercentage: 0,
      });
      
      if (!response.success) {
        throw new Error('Failed to update spending habits');
      }

      dispatch(setSpending({ habit: selectedSpending, percentage: 0 }));
      console.log('Spending habits updated successfully');
      
      // Small delay to ensure backend state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get final onboarding status
      console.log('Checking onboarding status...');
      const statusResponse = await onboardingApi.getOnboardingStatus();
      console.log('Onboarding status response:', statusResponse);

      if (!statusResponse.success) {
        throw new Error('Failed to get onboarding status');
      }

      if (statusResponse.data.spendingHabitsSet && statusResponse.data.onboardingComplete) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        console.error('Onboarding not complete:', statusResponse.data);
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      }
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update spending habits';
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
          <Text style={styles.title}>What's your <Text style={styles.titleHighlight}>spending style</Text>?</Text>
          <Text style={styles.subtitle}>
            Understanding your spending habits helps us create a personalized financial plan
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {spendingOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedSpending === option.id && styles.optionCardSelected,
              ]}
              onPress={() => handleSpendingSelect(option.id)}>
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIconContainer,
                  selectedSpending === option.id && styles.optionIconContainerSelected,
                ]}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={wp(6)}
                    color={selectedSpending === option.id ? COLORS.white : COLORS.primary}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
              {selectedSpending === option.id && (
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
              selectedSpending && styles.buttonActive
            ]}
            onPress={handleSubmit}
            disabled={!selectedSpending || isLoading}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={[
                styles.buttonText,
                selectedSpending && styles.buttonTextActive
              ]}>
                Continue
              </Text>
            )}
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingTop: hp(3),
  },
  topSection: {
    paddingHorizontal: wp(6),
    marginBottom: hp(3),
  },
  title: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.black,
    marginBottom: hp(1),
  },
  titleHighlight: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: hp(2.5),
  },
  optionsContainer: {
    paddingHorizontal: wp(6),
    gap: hp(1.5),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp(3.5),
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
    gap: wp(3),
  },
  optionIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  optionIconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    marginBottom: hp(0.3),
  },
  optionDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
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

export default SpendingScreen; 