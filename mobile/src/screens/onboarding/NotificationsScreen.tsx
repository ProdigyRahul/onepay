import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
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
      // Check for battery optimization
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

      // Check for power manager restrictions
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

      // Request permissions
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        // Create a channel for Android
        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
            importance: 4, // High importance
          });
        }

        // Display a test notification
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

        // Navigate to profile screen
        navigation.navigate('OnboardingProfile');
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications to receive important updates about your transactions.',
          [
            {
              text: 'Open Settings',
              onPress: async () => {
                if (Platform.OS === 'ios') {
                  await notifee.openNotificationSettings();
                } else {
                  await notifee.openNotificationSettings();
                }
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
        <View style={styles.topSection}>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.subtitle}>
            Get instant notifications about your transactions, rewards, and important account activities
          </Text>
        </View>

        <View style={styles.illustrationContainer}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={wp(25)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.permissionsContainer}>
          <View style={styles.permissionItem}>
            <View style={styles.permissionIcon}>
              <MaterialCommunityIcons
                name="bell-badge-outline"
                size={wp(6)}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Push Notifications</Text>
              <Text style={styles.permissionLabel}>
                Stay informed about your transactions and account security
              </Text>
              <View style={styles.recommendedTag}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.button}
            onPress={requestPermissions}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Setting up...' : 'Enable Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('OnboardingProfile')}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    paddingTop: StatusBar.currentHeight || 0,
  },
  topSection: {
    paddingTop: hp(4),
    paddingHorizontal: wp(6),
    marginBottom: hp(4),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.primary,
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: hp(3),
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: hp(4),
    backgroundColor: '#F0F7FF',
    paddingVertical: hp(4),
  },
  permissionsContainer: {
    paddingHorizontal: wp(6),
  },
  permissionItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 1,
  },
  permissionIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    marginBottom: hp(1),
  },
  permissionLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: hp(1),
  },
  recommendedTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    alignSelf: 'flex-start',
  },
  recommendedText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
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
  buttonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  skipButton: {
    width: '100%',
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default NotificationsScreen;
