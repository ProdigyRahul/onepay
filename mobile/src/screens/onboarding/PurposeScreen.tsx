import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';

type PurposeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingPurpose'
>;

interface PurposeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const purposeOptions: PurposeOption[] = [
  {
    id: 'payments',
    title: 'Everyday payments',
    description: 'UPI, Credit Card, Recharges, Bills',
    icon: 'bank-transfer',
  },
  {
    id: 'loans',
    title: 'Loans',
    description: 'ZIP-EMI, Credit Score',
    icon: 'cash-fast',
  },
  {
    id: 'investments',
    title: 'Invest & grow my money',
    description: 'FD, Xtra, Gold, Mutual Funds',
    icon: 'trending-up',
  },
  {
    id: 'tracking',
    title: 'Track my bank spends',
    description: 'with MobiKwik Lens',
    icon: 'chart-timeline-variant',
  },
];

const PurposeScreen = () => {
  const navigation = useNavigation<PurposeScreenNavigationProp>();
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!selectedPurpose) return;
    
    setIsLoading(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Text style={styles.title}>I'm here for</Text>
          <Text style={styles.subtitle}>
            Choose your primary reason for using OnePay
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
              onPress={() => setSelectedPurpose(option.id)}>
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIconContainer,
                  selectedPurpose === option.id && styles.optionIconContainerSelected,
                ]}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={wp(6)}
                    color={selectedPurpose === option.id ? COLORS.white : COLORS.primary}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    selectedPurpose === option.id && styles.optionTitleSelected
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    selectedPurpose === option.id && styles.optionDescriptionSelected
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={wp(6)}
                color={selectedPurpose === option.id ? COLORS.primary : COLORS.textSecondary}
                style={styles.arrow}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.button,
              selectedPurpose && styles.buttonActive,
            ]}
            onPress={handleContinue}
            disabled={!selectedPurpose || isLoading}>
            <Text
              style={[
                styles.buttonText,
                selectedPurpose && styles.buttonTextActive,
              ]}>
              {isLoading ? 'Please wait...' : 'Continue'}
            </Text>
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
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.lg,
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
  optionIconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.black,
    marginBottom: hp(0.5),
  },
  optionTitleSelected: {
    color: COLORS.primary,
  },
  optionDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  optionDescriptionSelected: {
    color: COLORS.black,
  },
  arrow: {
    marginLeft: wp(2),
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
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