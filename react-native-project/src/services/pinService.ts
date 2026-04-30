// PIN Service for React Native
// Handles PIN generation, hashing, and comparison using bcrypt for security

import bcrypt from 'bcryptjs';

/**
 * Generate a random 8-digit PIN
 */
export const generatePin = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

/**
 * Hash PIN using bcrypt (12 rounds)
 * Much more secure than SHA-256 against brute-force attacks
 */
export const hashPin = async (pin: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(pin, saltRounds);
};

/**
 * Compare input PIN with stored hash
 * Uses bcrypt.compare for constant-time comparison
 */
export const comparePin = async (
  inputPin: string,
  storedHash: string
): Promise<boolean> => {
  return await bcrypt.compare(inputPin, storedHash);
};

/**
 * PIN validation utilities
 */
export const validatePin = (pin: string): {
  valid: boolean;
  error?: string;
} => {
  if (!pin) {
    return { valid: false, error: 'PIN không được để trống' };
  }
  
  if (pin.length !== 8) {
    return { valid: false, error: 'PIN phải có đúng 8 chữ số' };
  }
  
  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: 'PIN chỉ được chứa chữ số' };
  }
  
  return { valid: true };
};

export interface PinResetRequest {
  id: string;
  email: string | null;
  role: string | null;
  userId: string | null;
  otpCode: string | null;
  expiresAt: string | null;
  used: boolean | null;
  attempts: number | null;
  createdAt: string | null;
}