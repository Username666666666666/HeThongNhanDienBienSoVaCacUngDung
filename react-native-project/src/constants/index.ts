export const USER_ROLES = {
  OWNER: 'owner' as const,
  SUPERVISOR: 'supervisor' as const,
  ADMIN: 'admin' as const,
  PROVIDER: 'provider' as const,
  SUPPORT: 'support' as const,
};

export const ROUTES = {
  LOGIN: 'Login' as const,
  REGISTER: 'Register' as const,
  FORGOT_PASSWORD: 'ForgotPassword' as const,
  HOME: 'Home' as const,
  PROFILE: 'Profile' as const,
  COMMUNITY: 'Community' as const,
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 6 ký tự',
  NETWORK_ERROR: 'Lỗi mạng, vui lòng thử lại',
  UNAUTHORIZED: 'Không có quyền truy cập',
  LOGIN_FAILED: 'Email hoặc mật khẩu không chính xác',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
};
