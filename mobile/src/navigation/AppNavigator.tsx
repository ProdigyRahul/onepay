import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import NotificationsScreen from '../screens/onboarding/NotificationsScreen';
import ProfileScreen from '../screens/onboarding/ProfileScreen';
import AgeScreen from '../screens/onboarding/AgeScreen';
import PurposeScreen from '../screens/onboarding/PurposeScreen';
import IncomeScreen from '../screens/onboarding/IncomeScreen';
import SpendingScreen from '../screens/onboarding/SpendingScreen';
import KycDocumentScreen from '../screens/onboarding/KycDocumentScreen';
import KycStatusScreen from '../screens/onboarding/KycStatusScreen';
import { COLORS } from '../theme/colors';
import { useAppSelector } from '../store/store';
import { onboardingApi } from '../services/api/onboarding';
import { kycApi } from '../services/api/kyc';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Splash');
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (token && user) {
          try {
            // First check onboarding status
            const statusResponse = await onboardingApi.getOnboardingStatus();
            const status = statusResponse.data;
            console.log('Onboarding status:', status);

            // Only check KYC status if profile is completed
            let kycStatus = null;
            if (status.profileCompleted) {
              try {
                const kycResponse = await kycApi.getKycStatus();
                kycStatus = kycResponse.data;
                console.log('KYC status:', kycStatus);
              } catch (error) {
                console.log('Error getting KYC status:', error);
              }
            }

            // First handle non-KYC onboarding steps
            if (!status.profileCompleted) {
              setInitialRoute('NotificationsPermission');
            } else if (!status.ageVerified) {
              setInitialRoute('OnboardingAge');
            } else if (!status.primaryGoalSet) {
              setInitialRoute('OnboardingPurpose');
            } else if (!status.incomeRangeSet) {
              setInitialRoute('OnboardingIncome');
            } else if (!status.spendingHabitsSet) {
              setInitialRoute('OnboardingSpending');
            }
            // Then handle KYC flow
            else if (kycStatus?.status === 'PENDING_VERIFICATION') {
              setInitialRoute('OnboardingKycStatus');
            } else if (kycStatus?.status === 'REJECTED') {
              setInitialRoute('OnboardingKycDocument');
            } else if (!kycStatus?.status || kycStatus.status === null) {
              setInitialRoute('OnboardingKycDocument');
            }
            // Finally, if everything is complete and KYC is verified
            else if (status.onboardingComplete && kycStatus.status === 'VERIFIED') {
              setInitialRoute('Home');
            } else {
              // Fallback to KYC document screen
              setInitialRoute('OnboardingKycDocument');
            }
          } catch (error) {
            console.error('Error checking status:', error);
            setInitialRoute('Login');
          }
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setInitialRoute('Login');
      } finally {
        // Delay removing splash screen slightly to ensure smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    initializeApp();
  }, [token, user]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.backgroundPrimary,
          },
          headerStyle: {
            backgroundColor: COLORS.backgroundPrimary,
          },
          headerTitleStyle: {
            color: COLORS.primary,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationsPermission"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingProfile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingAge"
          component={AgeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingPurpose"
          component={PurposeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingIncome"
          component={IncomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingSpending"
          component={SpendingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingKycDocument"
          component={KycDocumentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OnboardingKycStatus"
          component={KycStatusScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
