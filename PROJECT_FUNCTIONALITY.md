# PROJECT FUNCTIONALITY

## Tổng quan
Dự án là một hệ thống quản lý bãi đỗ xe thông minh, bao gồm nhiều vai trò người dùng: owner, supervisor, admin, provider, support.

## Chức năng chung
- Đăng ký, đăng nhập, quên mật khẩu.
- Quản lý profile người dùng.
- Cộng đồng bãi đỗ: feed, review, báo cáo mất trộm, chat, game kiếm xu.
- Đa vai trò: người dùng, giám sát, quản trị, nhà cung cấp, nhân viên hỗ trợ.

## Các module chính

### 1. Authentication
- `src/app/pages/Login.tsx` - Đăng nhập bằng email/password và Google.
- `src/app/pages/Register.tsx` - Đăng ký tài khoản mới.
- `src/app/pages/ForgotPassword.tsx` - Quên mật khẩu.
- `src/app/pages/AuthCallback.tsx` - Xử lý callback OAuth.

### 2. User profile
- `src/app/pages/Profile.tsx` - Xem, chỉnh sửa hồ sơ cá nhân, thay đổi PIN, tải avatar.

### 3. Owner / Người dùng
- `src/app/pages/owner/OwnerDashboard.tsx` - Bảng điều khiển chủ xe.
- `src/app/pages/owner/RegisterVehicle.tsx` - Đăng ký phương tiện.
- `src/app/pages/owner/BrowseParkingLots.tsx` - Duyệt bãi đỗ.
- `src/app/pages/owner/ParkingLotDetails.tsx` - Chi tiết bãi đỗ.
- `src/app/pages/owner/ParkingZoneSelection.tsx` - Chọn khu vực đỗ xe.
- `src/app/pages/owner/VehicleTypeSelection.tsx` - Chọn loại phương tiện.
- `src/app/pages/owner/SpotSelection.tsx` - Chọn vị trí đỗ.
- `src/app/pages/owner/ParkingRegistration.tsx` - Ghi nhận đỗ xe.
- `src/app/pages/owner/VehicleStatus.tsx` - Trạng thái xe.
- `src/app/pages/owner/TopUpCoins.tsx` - Nạp xu ảo.
- `src/app/pages/owner/VehicleEntryExitLog.tsx` - Lịch sử ra/vào.

### 4. Supervisor / Giám sát
- `src/app/pages/supervisor/SupervisorDashboard.tsx` - Bảng điều khiển giám sát.
- `src/app/pages/supervisor/GateManagement.tsx` - Quản lý cổng ra/vào.
- `src/app/pages/supervisor/DualGateMonitoring.tsx` - Giám sát hai cổng cùng lúc.
- `src/app/pages/supervisor/SuspiciousVehicles.tsx` - Xe nghi vấn.
- `src/app/pages/supervisor/SuspiciousHistory.tsx` - Lịch sử nghi vấn.
- `src/app/pages/supervisor/ShiftManagement.tsx` - Quản lý ca trực.
- `src/app/pages/supervisor/VehicleEntryExitLog.tsx` - Lịch sử xe.
- `src/app/pages/supervisor/SupervisorProfile.tsx` - Hồ sơ giám sát.

### 5. Admin / Quản trị
- `src/app/pages/admin/AdminDashboard.tsx` - Dashboard tổng quan.
- `src/app/pages/admin/ParkingLotConfig.tsx` - Cấu hình bãi đỗ.
- `src/app/pages/admin/Statistics.tsx` - Thống kê.
- `src/app/pages/admin/ServiceSubscription.tsx` - Thuê dịch vụ.
- `src/app/pages/admin/CommunityModeration.tsx` - Duyệt cộng đồng.
- `src/app/pages/admin/ShiftVideoLogs.tsx` - Lịch sử video ca trực.
- `src/app/pages/admin/StaffManagement.tsx` - Quản lý nhân sự.
- `src/app/pages/admin/MyParkingLots.tsx` - Quản lý bãi đỗ của admin.
- `src/app/pages/admin/ServiceRegistration.tsx` - Đăng ký dịch vụ.
- `src/app/pages/admin/CameraManagement.tsx` - Quản lý camera.
- `src/app/pages/admin/AdminPinSecurity.tsx` - Khóa PIN admin.

### 6. Provider / Nhà cung cấp
- `src/app/pages/provider/ProviderDashboard.tsx` - Tổng quan nhà cung cấp.
- `src/app/pages/provider/VirtualCoinSettings.tsx` - Quản lý xu ảo.
- `src/app/pages/provider/ServiceManagement.tsx` - Quản lý dịch vụ.
- `src/app/pages/provider/DeviceManagement.tsx` - Quản lý thiết bị.
- `src/app/pages/provider/AccountManagement.tsx` - Quản lý tài khoản.
- `src/app/pages/provider/ProviderStatistics.tsx` - Thống kê dành cho provider.
- `src/app/pages/provider/SystemSettings.tsx` - Cài đặt hệ thống.
- `src/app/pages/provider/PackageManagement.tsx` - Quản lý gói dịch vụ.
- `src/app/pages/provider/MaintenanceSchedule.tsx` - Lịch bảo trì.
- `src/app/pages/provider/VehicleVerify.tsx` - Xác thực phương tiện.

### 7. Community / Cộng đồng
- `src/app/pages/Community.tsx` - Trang chính cộng đồng và nhập mã.
- `src/app/pages/community/CommunityFeed.tsx` - Kênh thông tin cộng đồng.
- `src/app/pages/community/ParkingReviews.tsx` - Đánh giá bãi đỗ.
- `src/app/pages/community/TheftReportPage.tsx` - Báo cáo trộm cắp.
- `src/app/pages/community/SupportPage.tsx` - Hỗ trợ cộng đồng.
- `src/app/pages/community/CommunityChat.tsx` - Chat nội bộ cộng đồng.
- `src/app/pages/community/CoinGames.tsx` - Trò chơi kiếm xu.

### 8. Hệ thống định tuyến và bảo mật
- `src/app/routes.tsx` - Định nghĩa route toàn bộ ứng dụng.
- `src/app/components/ProtectedRoute.tsx` - Bảo vệ route theo role.
- `src/app/context/AuthContext.tsx` - Quản lý auth, profile và tiền ảo.

### 8. Custom Hooks
- `src/app/hooks/useAuthForm.ts` - Xác thực biểu mẫu đăng nhập/đăng ký.
- `src/app/hooks/usePermissions.ts` - Kiểm tra quyền dựa trên role người dùng.
- `src/app/hooks/useNotifications.ts` - Quản lý thông báo.
- `src/app/hooks/useModalState.ts` - Quản lý trạng thái modal (open/close/toggle).
- `src/app/hooks/useAsync.ts` - Handle async operations với loading/error/success.
- `src/app/hooks/useFormState.ts` - Quản lý form state, errors, touched fields.

## 9. Utilities và Helpers
- `src/app/utils/formatters.ts` - Hàm format tiền, ngày giờ, số điện thoại Việt Nam.
- `src/app/utils/navigation.ts` - Điều hướng dựa trên role người dùng.
- `src/app/utils/supabase.ts` - Khởi tạo client Supabase.
- `src/app/utils/types.ts` - Các kiểu dữ liệu TypeScript tập trung.
- `src/app/service/queryHelper.ts` - Wrapper generic cho Supabase queries với error handling tập trung.
- `src/app/service/lprService.ts` - Dịch vụ nhận dạng biển số xe.
- `src/app/service/pinService.ts` - Dịch vụ quản lý PIN và xác thực.

## 10. Constants
- `src/app/constants/index.ts` - Các hằng số cho roles, routes, error messages.
