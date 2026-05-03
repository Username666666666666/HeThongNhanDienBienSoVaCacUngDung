/**
 * Format tiền tệ VND
 */
export const formatCurrency = (amount: number, currency = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format ngày giờ theo định dạng Việt Nam
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
};

/**
 * Format chỉ ngày
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

/**
 * Format thời gian hoặc thời lượng (hh:mm:ss)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Kiểm tra xem email có hợp lệ không
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra xem mật khẩu có đủ mạnh không
 */
export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Chuẩn hóa số điện thoại Việt Nam
 */
export const normalizePhoneNumber = (phone: string): string => {
  // Loại bỏ khoảng trắng và ký tự đặc biệt
  const cleaned = phone.replace(/\D/g, '');
  
  // Nếu bắt đầu bằng 0, giữ nguyên
  if (cleaned.startsWith('0')) {
    return cleaned;
  }
  
  // Nếu bắt đầu bằng 84 (country code), chuyển thành 0
  if (cleaned.startsWith('84')) {
    return '0' + cleaned.slice(2);
  }
  
  return cleaned;
};

/**
 * Kiểm tra xem số điện thoại Việt Nam có hợp lệ không
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Số điện thoại Việt Nam bắt đầu bằng 0 và có 10 chữ số
  return /^0\d{9}$/.test(normalized);
};

/**
 * Cắt chuỗi dài quá
 */
export const truncateString = (str: string, maxLength: number, suffix = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Chuyển đổi camelCase thành snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Chuyển đổi snake_case thành camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};
