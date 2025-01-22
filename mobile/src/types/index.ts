import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  OnboardingPurpose: undefined;
  OnboardingIncome: undefined;
  OnboardingSpending: undefined;
  OnboardingKyc: undefined;
  OnboardingKycDocument: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
