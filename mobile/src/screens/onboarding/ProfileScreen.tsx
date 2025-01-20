import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingProfile'
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const formatPanNumber = (text: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const formatted = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (formatted.length <= 10) {
      setPanNumber(formatted);
    }
  };

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || panNumber.length !== 10) {
      return;
    }

    try {
      setIsLoading(true);
      // Here you would typically make an API call to update the user's profile
      navigation.navigate('OnboardingAge');
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && panNumber.length === 10;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

          {/* PAN Card Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, focusedInput === 'pan' && styles.labelFocused]}>
              PAN Card Number
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'pan' && styles.inputFocused
              ]}
              placeholder="Enter your 10-digit PAN number"
              placeholderTextColor={COLORS.disabled}
              value={panNumber}
              onChangeText={formatPanNumber}
              onFocus={() => setFocusedInput('pan')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="characters"
              maxLength={10}
            />
            <Text style={[
              styles.helperText,
              focusedInput === 'pan' && styles.helperTextFocused
            ]}>
              Format: ABCDE1234F
            </Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.button,
              isFormValid && styles.buttonActive,
            ]}
            onPress={handleContinue}
            disabled={!isFormValid || isLoading}>
            <Text
              style={[
                styles.buttonText,
                isFormValid && styles.buttonTextActive,
              ]}>
              {isLoading ? 'Setting up...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: FONT_SIZES.xxl,
    color: COLORS.black,
    marginBottom: hp(2),
  },
  titleHighlight: {
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
  },
  inputContainer: {
    marginBottom: hp(3),
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.black,
    marginBottom: hp(1),
  },
  labelFocused: {
    color: COLORS.primary,
  },
  input: {
    height: hp(6),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  helperText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  helperTextFocused: {
    color: COLORS.primary,
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

export default ProfileScreen; 