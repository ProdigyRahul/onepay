import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { COLORS } from '../../theme/colors';
import { FONTS, FONT_SIZES } from '../../theme/typography';
import { wp, hp } from '../../utils/responsive';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLoading, setError } from '../../store/slices/onboardingSlice';
import { kycApi } from '../../services/api/kyc';

type KycDocumentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingKycDocument'
>;

interface ImageInfo {
  uri: string;
  type: string;
  fileName: string;
}

const KycDocumentScreen = () => {
  const navigation = useNavigation<KycDocumentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.onboarding);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);

  const handleImageResponse = (response: ImagePickerResponse) => {
    console.log('Image picker response:', response);
    if (response.didCancel || !response.assets || response.assets.length === 0) {
      console.log('Image selection cancelled or no assets');
      return;
    }

    if (response.errorCode) {
      console.error('ImagePicker Error:', response.errorMessage);
      Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      return;
    }

    const asset = response.assets[0];
    if (!asset.uri || !asset.type || !asset.fileName) {
      console.error('Invalid image asset:', asset);
      Alert.alert('Error', 'Invalid image selected');
      return;
    }

    console.log('Selected image asset:', asset);
    setSelectedImage({
      uri: asset.uri,
      type: asset.type,
      fileName: asset.fileName,
    });
  };

  const handleCameraCapture = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 1280,
      maxHeight: 1280,
      saveToPhotos: true,
    };

    launchCamera(options, handleImageResponse);
  };

  const handleGalleryPick = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 1280,
      maxHeight: 1280,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Upload PAN Card',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleCameraCapture,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleGalleryPick,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select a PAN card image first');
      return;
    }

    try {
      dispatch(setLoading(true));
      console.log('Selected image asset:', selectedImage);

      // Create form data
      const formData = new FormData();
      formData.append('panCard', {
        uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || 'pancard.jpg',
      });

      console.log('Sending upload request...');
      const response = await kycApi.uploadPanCard(formData);
      console.log('Upload successful:', response);

      // Navigate to KYC status screen
      navigation.replace('OnboardingKycStatus');

    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
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
        <View style={styles.header}>
          <Text style={styles.title}>Upload your <Text style={styles.titleHighlight}>PAN Card</Text></Text>
          <Text style={styles.subtitle}>
            Please provide a clear photo of your PAN card for verification
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={[styles.uploadCard, selectedImage && styles.uploadCardWithImage]}
            onPress={showImagePickerOptions}
            activeOpacity={0.8}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={wp(8)}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.uploadText}>Tap to select PAN card image</Text>
                <Text style={styles.uploadSubtext}>Take a photo or choose from gallery</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Guidelines for PAN card photo:</Text>
            <View style={styles.guideline}>
              <MaterialCommunityIcons name="check-circle" size={wp(5)} color={COLORS.success} />
              <Text style={styles.guidelineText}>All corners should be clearly visible</Text>
            </View>
            <View style={styles.guideline}>
              <MaterialCommunityIcons name="check-circle" size={wp(5)} color={COLORS.success} />
              <Text style={styles.guidelineText}>Image should not be blurry</Text>
            </View>
            <View style={styles.guideline}>
              <MaterialCommunityIcons name="check-circle" size={wp(5)} color={COLORS.success} />
              <Text style={styles.guidelineText}>File size should be less than 5MB</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, (isLoading || !selectedImage) && styles.buttonDisabled]}
            onPress={handleUpload}
            disabled={isLoading || !selectedImage}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Upload Document</Text>
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
  uploadSection: {
    paddingHorizontal: wp(6),
  },
  uploadCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: wp(4),
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    padding: wp(6),
    alignItems: 'center',
    marginBottom: hp(4),
    minHeight: hp(25),
    justifyContent: 'center',
  },
  uploadCardWithImage: {
    padding: 0,
    borderStyle: 'solid',
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  uploadText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: hp(1),
  },
  uploadSubtext: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  previewImage: {
    width: '100%',
    height: hp(25),
    borderRadius: wp(4),
    resizeMode: 'cover',
  },
  guidelinesContainer: {
    marginTop: hp(4),
  },
  guidelinesTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: hp(2),
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  guidelineText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginLeft: wp(2),
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
});

export default KycDocumentScreen;
