export const USER_ROLES = {
  OWNER: 'owner',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
  PROVIDER: 'provider',
  SUPPORT: 'support',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROUTES = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  AUTH_CALLBACK: 'AuthCallback',
  PROFILE: 'Profile',
  COMMUNITY: 'Community',
  OWNER_DASHBOARD: 'OwnerDashboard',
  SUPERVISOR_DASHBOARD: 'SupervisorDashboard',
  ADMIN_DASHBOARD: 'AdminDashboard',
  PROVIDER_DASHBOARD: 'ProviderDashboard',
  SUPPORT_DASHBOARD: 'SupportDashboard',
  DUAL_GATE_MONITORING: 'DualGateMonitoring',
  PARKING_HISTORY: 'ParkingHistory',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu không hợp lệ',
  NETWORK_ERROR: 'Lỗi mạng, vui lòng thử lại',
  UNAUTHORIZED: 'Không có quyền truy cập',
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
