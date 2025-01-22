import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NotificationsPermission'
>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationSettings();
  }, []);

  const checkNotificationSettings = async () => {
    await notifee.getNotificationSettings();

    if (Platform.OS === 'android') {
      const batteryOptimizationEnabled = await notifee.isBatteryOptimizationEnabled();
      if (batteryOptimizationEnabled) {
        Alert.alert(
          'Optimize Battery Usage',
          'To ensure you receive notifications, please disable battery optimization for OnePay.',
          [
            {
              text: 'Open Settings',
              onPress: async () => await notifee.openBatteryOptimizationSettings(),
            },
            {
              text: 'Skip',
              style: 'cancel',
            },
          ]
        );
      }

      const powerManagerInfo = await notifee.getPowerManagerInfo();
      if (powerManagerInfo.activity) {
        Alert.alert(
          'Background Restrictions',
          'Please adjust your settings to allow OnePay to run in the background for notifications.',
          [
            {
              text: 'Open Settings',
              onPress: async () => await notifee.openPowerManagerSettings(),
            },
            {
              text: 'Skip',
              style: 'cancel',
            },
          ]
        );
      }
    }
  };

  const requestPermissions = async () => {
    try {
      setIsLoading(true);
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: 4,
          });
        }

        await notifee.displayNotification({
          title: 'Welcome to OnePay! ',
          body: 'You will now receive important updates about your transactions.',
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });

        navigation.navigate('OnboardingProfile');
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications to receive important updates about your transactions.',
          [
            {
              text: 'Open Settings',
              onPress: async () => {
                await notifee.openNotificationSettings();
              },
            },
            {
              text: 'Skip',
              onPress: () => navigation.navigate('OnboardingProfile'),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      Alert.alert('Error', 'Failed to request notification permissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enable <Text style={styles.titleHighlight}>Notifications</Text></Text>
          <Text style={styles.subtitle}>
            Stay informed about your transactions and account activities in real-time
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureItem} activeOpacity={0.8}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={wp(6)}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Transaction Updates</Text>
              <Text style={styles.featureDescription}>
                Get instant alerts for all your payments and transfers
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem} activeOpacity={0.8}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons
                name="shield-check"
                size={wp(6)}
                color={COLORS.success}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Security Alerts</Text>
              <Text style={styles.featureDescription}>
                Stay protected with real-time security notifications
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureItem} activeOpacity={0.8}>
            <View style={styles.featureIconContainer}>
              <MaterialCommunityIcons
                name="gift"
                size={wp(6)}
                color={COLORS.warning}
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Special Offers</Text>
              <Text style={styles.featureDescription}>
                Never miss out on rewards and exclusive deals
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={requestPermissions}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Enable Notifications</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('OnboardingProfile')}>
            <Text style={styles.skipButtonText}>I'll do this later</Text>
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
  },
  header: {
    paddingTop: hp(4),
    paddingHorizontal: wp(6),
    marginBottom: hp(4),
  },
  title: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.text,
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
    lineHeight: hp(2.8),
  },
  featuresContainer: {
    paddingHorizontal: wp(6),
    marginBottom: hp(4),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    elevation: 2,
    marginBottom: hp(2),
  },
  featureIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  featureDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: hp(2.2),
  },
  bottomSection: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
    marginTop: 'auto',
  },
  button: {
    width: '100%',
    height: hp(6),
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginBottom: hp(2),
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
    elevation: 1,
  },
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  skipButton: {
    width: '100%',
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
});

export default NotificationsScreen;
