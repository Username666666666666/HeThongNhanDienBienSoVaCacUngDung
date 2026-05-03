export const USER_ROLES = {
  OWNER: 'owner',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin',
  PROVIDER: 'provider',
  SUPPORT: 'support',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  AUTH_CALLBACK: '/auth/callback',
  PROFILE: '/profile',
  COMMUNITY: '/community',
  OWNER_DASHBOARD: '/owner/dashboard',
  SUPERVISOR_DASHBOARD: '/supervisor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  PROVIDER_DASHBOARD: '/provider/dashboard',
  SUPPORT_DASHBOARD: '/support/dashboard',
} as const;

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu không hợp lệ',
  NETWORK_ERROR: 'Lỗi mạng, vui lòng thử lại',
  UNAUTHORIZED: 'Không có quyền truy cập',
} as const;