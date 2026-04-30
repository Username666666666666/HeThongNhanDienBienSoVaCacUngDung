// App constants for React Native mobile app
// Centralized configuration and constants

export const USER_ROLES = {
  OWNER: 'owner',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
  PROVIDER: 'provider',
  SUPPORT: 'support',
} as const;

export const ROUTES = {
  // Auth routes
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Owner routes
  OWNER_STACK: 'OwnerStack',
  OWNER_HOME: 'OwnerHome',
  VEHICLE_LIST: 'VehicleList',
  PARKING_LOTS: 'ParkingLots',
  BOOKING: 'Booking',
  
  // Supervisor routes
  SUPERVISOR_STACK: 'SupervisorStack',
  SUPERVISOR_HOME: 'SupervisorHome',
  GATE_MANAGEMENT: 'GateManagement',
  
  // Admin routes
  ADMIN_STACK: 'AdminStack',
  ADMIN_HOME: 'AdminHome',
  PARKING_CONFIG: 'ParkingConfig',
  
  // Shared routes
  PROFILE: 'Profile',
  COMMUNITY: 'Community',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
  NETWORK_ERROR: 'Lỗi mạng, vui lòng thử lại',
  UNAUTHORIZED: 'Không có quyền truy cập',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
  SERVER_ERROR: 'Lỗi máy chủ, vui lòng thử lại sau',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đã đăng xuất',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
} as const;

export const VEHICLE_TYPES = {
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  TRUCK: 'truck',
} as const;

export const PARKING_SPOT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PREPAID: 'prepaid',
} as const;

// Timeouts and delays
export const DELAYS = {
  DEBOUNCE: 300,
  THROTTLE: 500,
  TOAST_DURATION: 3000,
  ANIMATION: 300,
} as const;

// API endpoints (if using REST fallback)
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  AUTH: '/auth',
  USERS: '/users',
  VEHICLES: '/vehicles',
  PARKING_LOTS: '/parking-lots',
  SESSIONS: '/sessions',
  COMMUNITY: '/community',
} as const;