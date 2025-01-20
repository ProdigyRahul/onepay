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
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds splash screen

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.backgroundPrimary,
          },
          headerStyle: {
            backgroundColor: COLORS.backgroundPrimary,
          },
          headerTitleStyle: {
            color: COLORS.textPrimary,
          },
        }}
      >
        {isLoading ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
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
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
