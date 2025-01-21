import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setProfile, setLoading, setError } from '../../store/slices/onboardingSlice';
import { onboardingApi } from '../../services/api/onboarding';
import axios from 'axios';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingProfile'
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.onboarding);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !panNumber.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validatePAN(panNumber)) {
      Alert.alert('Error', 'Please enter a valid PAN number (e.g., ABCDE1234F)');
      return;
    }

    try {
      dispatch(setLoading(true));
      const profileData = { firstName, lastName, email, panNumber };
      console.log('Submitting profile data:', profileData);
      const response = await onboardingApi.updateProfile(profileData);
      console.log('Profile update response:', response);
      dispatch(setProfile(profileData));
      navigation.navigate('OnboardingAge');
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      if (axios.isAxiosError(err)) {
        console.error('Network Error Details:', {
          status: err.response?.status,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            baseURL: err.config?.baseURL,
          }
        });
      }
      dispatch(setError(errorMessage));
      Alert.alert('Error', `Failed to update profile: ${errorMessage}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <Text style={styles.title}>Complete your <Text style={styles.titleHighlight}>profile</Text></Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to personalize your experience
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* First Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'firstName' && styles.labelFocused]}>
              First Name
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'firstName' && styles.inputFocused
              ]}
              placeholder="Enter your first name"
              placeholderTextColor={COLORS.disabled}
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'lastName' && styles.labelFocused]}>
              Last Name
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'lastName' && styles.inputFocused
              ]}
              placeholder="Enter your last name"
              placeholderTextColor={COLORS.disabled}
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'email' && styles.labelFocused]}>
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'email' && styles.inputFocused
              ]}
              placeholder="Enter your email address"
              placeholderTextColor={COLORS.disabled}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* PAN Number Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'pan' && styles.labelFocused]}>
              PAN Number
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'pan' && styles.inputFocused
              ]}
              placeholder="Enter your PAN number"
              placeholderTextColor={COLORS.disabled}
              value={panNumber}
              onChangeText={(text) => setPanNumber(text.toUpperCase())}
              onFocus={() => setFocusedInput('pan')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Continue'}
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
  formContainer: {
    paddingHorizontal: wp(6),
    gap: hp(3),
  },
  inputContainer: {
    gap: hp(1),
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  input: {
    height: hp(6),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(4),
    marginTop: 'auto',
  },
  button: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});

export default ProfileScreen; 