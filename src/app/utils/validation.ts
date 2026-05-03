/**
 * Input validation and sanitization utilities
 * Provides type-safe validation for user inputs across the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

// Email validation
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email phải là chuỗi ký tự' };
  }

  const sanitized = email.trim().toLowerCase();
  if (!sanitized) {
    return { isValid: false, error: 'Email không được để trống' };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Định dạng email không hợp lệ' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email quá dài (tối đa 254 ký tự)' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// PIN validation (6 digits)
export function validatePIN(pin: unknown): ValidationResult {
  if (typeof pin !== 'string') {
    return { isValid: false, error: 'PIN phải là chuỗi ký tự' };
  }

  const sanitized = pin.trim();
  if (!sanitized) {
    return { isValid: false, error: 'PIN không được để trống' };
  }

  if (!/^\d{6}$/.test(sanitized)) {
    return { isValid: false, error: 'PIN phải gồm đúng 6 chữ số' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// Vietnamese license plate validation
export function validateLicensePlate(plate: unknown): ValidationResult {
  if (typeof plate !== 'string') {
    return { isValid: false, error: 'Biển số phải là chuỗi ký tự' };
  }

  const sanitized = plate.trim().toUpperCase().replace(/[\s.-]/g, '');
  if (!sanitized) {
    return { isValid: false, error: 'Biển số không được để trống' };
  }

  // Vietnamese license plate formats:
  // 29A12345, 29A123.45, 51F-12345, 59X1-123.45, etc.
  const plateRegex = /^[0-9]{2}[A-Z][0-9A-Z]?[0-9]{4,5}$/;

  if (!plateRegex.test(sanitized)) {
    return { isValid: false, error: 'Định dạng biển số không hợp lệ (VD: 29A12345)' };
  }

  if (sanitized.length > 10) {
    return { isValid: false, error: 'Biển số quá dài' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// Reservation code validation (8 characters: uppercase + numbers)
export function validateReservationCode(code: unknown): ValidationResult {
  if (typeof code !== 'string') {
    return { isValid: false, error: 'Mã đặt chỗ phải là chuỗi ký tự' };
  }

  const sanitized = code.trim().toUpperCase();
  if (!sanitized) {
    return { isValid: false, error: 'Mã đặt chỗ không được để trống' };
  }

  if (!/^[A-Z0-9]{8}$/.test(sanitized)) {
    return { isValid: false, error: 'Mã đặt chỗ phải gồm 8 ký tự (chữ in hoa + số)' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// Generic text validation with length limits
export function validateText(
  text: unknown,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    fieldName?: string;
  } = {}
): ValidationResult {
  const { minLength = 1, maxLength = 255, required = true, fieldName = 'Trường' } = options;

  if (typeof text !== 'string') {
    return { isValid: false, error: `${fieldName} phải là chuỗi ký tự` };
  }

  const sanitized = text.trim();
  if (required && !sanitized) {
    return { isValid: false, error: `${fieldName} không được để trống` };
  }

  if (sanitized.length < minLength) {
    return { isValid: false, error: `${fieldName} phải có ít nhất ${minLength} ký tự` };
  }

  if (sanitized.length > maxLength) {
    return { isValid: false, error: `${fieldName} không được vượt quá ${maxLength} ký tự` };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// File validation for images
export function validateImageFile(file: File): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'File không tồn tại' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Kích thước file không được vượt quá 10MB' };
  }

  // Check file name (basic sanitization)
  const fileName = file.name.trim();
  if (!fileName || fileName.length > 255) {
    return { isValid: false, error: 'Tên file không hợp lệ' };
  }

  return { isValid: true };
}

// Password validation (for registration/login)
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== 'string') {
    return { isValid: false, error: 'Mật khẩu phải là chuỗi ký tự' };
  }

  const sanitized = password.trim();
  if (!sanitized) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }

  if (sanitized.length < 8) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }

  if (sanitized.length > 128) {
    return { isValid: false, error: 'Mật khẩu không được vượt quá 128 ký tự' };
  }

  // Check for at least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(sanitized);
  const hasLowerCase = /[a-z]/.test(sanitized);
  const hasNumbers = /\d/.test(sanitized);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return {
      isValid: false,
      error: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// Phone number validation (Vietnamese format)
export function validatePhoneNumber(phone: unknown): ValidationResult {
  if (typeof phone !== 'string') {
    return { isValid: false, error: 'Số điện thoại phải là chuỗi ký tự' };
  }

  const sanitized = phone.trim().replace(/[\s\-\(\)]/g, '');
  if (!sanitized) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }

  // Vietnamese phone number formats
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(sanitized)) {
    return { isValid: false, error: 'Định dạng số điện thoại không hợp lệ (VD: 0987654321)' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// OTP validation (6 digits)
export function validateOTP(otp: unknown): ValidationResult {
  if (typeof otp !== 'string') {
    return { isValid: false, error: 'OTP phải là chuỗi ký tự' };
  }

  const sanitized = otp.trim();
  if (!sanitized) {
    return { isValid: false, error: 'OTP không được để trống' };
  }

  if (!/^\d{6}$/.test(sanitized)) {
    return { isValid: false, error: 'OTP phải gồm đúng 6 chữ số' };
  }

  return { isValid: true, sanitizedValue: sanitized };
}

// Sanitize HTML/text input (basic XSS prevention)
export function sanitizeTextInput(text: string): string {
  if (typeof text !== 'string') return '';

  return text
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, 10000); // Limit length
}

// Type guards for validation results
export function isValidEmail(email: unknown): email is string {
  return validateEmail(email).isValid;
}

export function isValidPIN(pin: unknown): pin is string {
  return validatePIN(pin).isValid;
}

export function isValidLicensePlate(plate: unknown): plate is string {
  return validateLicensePlate(plate).isValid;
}

export function isValidReservationCode(code: unknown): code is string {
  return validateReservationCode(code).isValid;
}