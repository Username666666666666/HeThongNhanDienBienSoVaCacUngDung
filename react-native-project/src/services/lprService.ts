// LPR (License Plate Recognition) Service for React Native
// Optimized for mobile camera and image handling

import * as ImagePicker from 'expo-image-picker';

export interface LPRResult {
  licensePlate: string;
  confidence: number;
  timestamp: Date;
}

interface GradioResponse {
  data: string[];
}

/**
 * Capture license plate from image using Gradio ML model
 */
export const processLicensePlateFromImage = async (
  imageUri: string
): Promise<LPRResult> => {
  try {
    // Convert image URI to blob for processing
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Send to Gradio API endpoint
    const formData = new FormData();
    formData.append('data', blob);

    const result = await fetch(
      process.env.REACT_APP_GRADIO_URL || 'http://localhost:7860/call/predict',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data: GradioResponse = await result.json();
    
    return {
      licensePlate: data.data[0] || '',
      confidence: 0.95, // Mock confidence - actual from model
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('LPR processing error:', error);
    throw new Error('Không thể nhận dạng biển số xe');
  }
};

/**
 * Capture image from camera using Expo
 */
export const captureImageFromCamera = async (): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      console.log('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error capturing image:', error);
    throw error;
  }
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      console.log('Media library permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

/**
 * Validate detected license plate format (Vietnamese)
 */
export const validateLicensePlate = (plate: string): {
  valid: boolean;
  error?: string;
} => {
  // Vietnamese plate format: XX-XXXX (province code + serial)
  const vietnamPlateRegex = /^[0-9A-Z]{2}-[0-9]{4}$/;
  
  if (!vietnamPlateRegex.test(plate)) {
    return { 
      valid: false, 
      error: 'Định dạng biển số không hợp lệ' 
    };
  }
  
  return { valid: true };
};