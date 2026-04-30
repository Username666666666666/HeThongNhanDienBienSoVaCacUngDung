/**
 * Application Constants
 * Centralized store for roles, routes, validation rules, and other constants
 */

/**
 * User Roles in the system
 */
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  SUPPORT: 'support',
  PROVIDER: 'provider',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Application Routes
 */
export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  AUTH_CALLBACK: '/auth-callback',
  NOT_FOUND: '/not-found',

  // Role-based Routes
  OWNER_ROOT: '/owner',
  ADMIN_ROOT: '/admin',
  SUPERVISOR_ROOT: '/supervisor',
  SUPPORT_ROOT: '/support',
  PROVIDER_ROOT: '/provider',

  // Common Routes
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
  SETTINGS: 'settings',
} as const;

/**
 * Virtual Coins Configuration
 */
export const VIRTUAL_COINS = {
  MIN_TOP_UP: 10000,
  MAX_TOP_UP: 10000000,
  MIN_PARKING_PAYMENT: 5000,
  WELCOME_BONUS: 50000,
} as const;

/**
 * PIN Configuration
 */
export const PIN = {
  LENGTH: 8,
  MIN_DIGITS: 8,
  HASH_ALGORITHM: 'SHA-256',
  RESET_OTP_EXPIRY_MINUTES: 15,
} as const;

/**
 * Parking Related Constants
 */
export const PARKING = {
  STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    MAINTENANCE: 'maintenance',
  },
  VEHICLE_TYPES: {
    CAR: 'car',
    MOTORCYCLE: 'motorcycle',
    TRUCK: 'truck',
    ELECTRIC: 'electric',
  },
  SESSION_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  PAYMENT_METHODS: {
    CASH: 'cash',
    COINS: 'coins',
    CARD: 'card',
    MOMO: 'momo',
    ZALOPAY: 'zalopay',
  },
} as const;

/**
 * API Configuration
 */
export const API = {
  LPR_ENDPOINT: 'tpc-pascal/LPR',
  LPR_PROCESS_METHOD: '/process_image',
  GRADIO_TIMEOUT_MS: 30000,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    USER_NOT_FOUND: 'Tài khoản không tồn tại',
    EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
    UNAUTHORIZED: 'Bạn không có quyền thực hiện hành động này',
  },
  PIN: {
    INVALID_PIN: 'Mã PIN không hợp lệ',
    PIN_NOT_SET: 'Chưa có mã PIN',
    PIN_MISMATCH: 'Mã PIN cũ không đúng',
    OTP_EXPIRED: 'Mã OTP đã hết hạn',
    OTP_INVALID: 'Mã OTP không đúng',
  },
  PARKING: {
    NO_AVAILABLE_SPOTS: 'Không có chỗ đỗ xe trống',
    INVALID_VEHICLE: 'Thông tin xe không hợp lệ',
    PLATE_NOT_RECOGNIZED: 'Không xác định được biển số',
    INSUFFICIENT_COINS: 'Số xu không đủ',
  },
  GENERAL: {
    NETWORK_ERROR: 'Lỗi kết nối mạng',
    SERVER_ERROR: 'Lỗi máy chủ, vui lòng thử lại',
    UNKNOWN_ERROR: 'Có lỗi xảy ra, vui lòng thử lại',
  },
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    PIN_CREATED: 'Mã PIN đã được tạo',
    PIN_UPDATED: 'Mã PIN đã được cập nhật',
  },
  PARKING: {
    VEHICLE_ENTRY: 'Xe đã vào bãi đỗ',
    VEHICLE_EXIT: 'Xe đã ra khỏi bãi đỗ',
    PAYMENT_SUCCESS: 'Thanh toán thành công',
  },
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+84|0)[0-9]{9,10}$/,
  PLATE_NUMBER_REGEX: /^[0-9]{2}[A-Z]-\d{4,5}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
} as const;

/**
 * Date/Time Configuration
 */
export const DATETIME = {
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm:ss',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  SIZES: [10, 20, 50, 100],
} as const;

/**
 * Toast Notification Duration (ms)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const;

export default {
  USER_ROLES,
  ROUTES,
  VIRTUAL_COINS,
  PIN,
  PARKING,
  API,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  DATETIME,
  PAGINATION,
  TOAST_DURATION,
};
