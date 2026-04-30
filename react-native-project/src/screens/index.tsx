import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ScreenProps {
  title: string;
  description?: string;
}

const ScreenWrapper = ({ title, description }: ScreenProps) => (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.inner}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        {description ?? 'Màn hình này đã được chuyển đổi sang React Native.'}
      </Text>
    </View>
  </ScrollView>
);

const createScreen = (title: string, description?: string) => () => (
  <ScreenWrapper title={title} description={description} />
);

export const Register = createScreen('Register', 'Đăng ký người dùng.');
export const Login = createScreen('Login', 'Đăng nhập vào hệ thống.');
export const ForgotPassword = createScreen('ForgotPassword', 'Khôi phục mật khẩu.');
export const AuthCallback = createScreen('AuthCallback', 'Xử lý callback xác thực.');
export const Profile = createScreen('Profile', 'Thông tin cá nhân và cập nhật hồ sơ.');
export const Community = createScreen('Community', 'Trang cộng đồng chung.');
export const InternalChatPage = createScreen('InternalChatPage', 'Chat nội bộ.');
export const OwnerDashboard = createScreen('OwnerDashboard', 'Bảng điều khiển chủ xe.');
export const RegisterVehicle = createScreen('RegisterVehicle', 'Đăng ký phương tiện.');
export const BrowseParkingLots = createScreen('BrowseParkingLots', 'Duyệt bãi đỗ.');
export const ParkingLotDetails = createScreen('ParkingLotDetails', 'Chi tiết bãi đỗ.');
export const ParkingZoneSelection = createScreen('ParkingZoneSelection', 'Chọn vùng đỗ.');
export const VehicleTypeSelection = createScreen('VehicleTypeSelection', 'Chọn loại xe.');
export const SpotSelection = createScreen('SpotSelection', 'Chọn vị trí đỗ.');
export const VehicleStatus = createScreen('VehicleStatus', 'Trạng thái phương tiện.');
export const ParkingRegistration = createScreen('ParkingRegistration', 'Đăng ký gửi xe.');
export const TopUpCoins = createScreen('TopUpCoins', 'Nạp xu ảo.');
export const OwnerVehicleEntryExitLog = createScreen('OwnerVehicleEntryExitLog', 'Lịch sử ra vào phương tiện.');
export const SupervisorDashboard = createScreen('SupervisorDashboard', 'Bảng điều khiển giám sát.');
export const GateManagement = createScreen('GateManagement', 'Quản lý cổng.');
export const DualGateMonitoring = createScreen('DualGateMonitoring', 'Giám sát cổng đôi.');
export const SuspiciousVehicles = createScreen('SuspiciousVehicles', 'Xe nghi vấn.');
export const SuspiciousHistory = createScreen('SuspiciousHistory', 'Lịch sử nghi vấn.');
export const ShiftManagement = createScreen('ShiftManagement', 'Quản lý ca.');
export const SupervisorVehicleEntryExitLog = createScreen('SupervisorVehicleEntryExitLog', 'Lịch sử ra vào giám sát.');
export const SupervisorProfile = createScreen('SupervisorProfile', 'Hồ sơ giám sát.');
export const SupportStaffDashboard = createScreen('SupportStaffDashboard', 'Bảng điều khiển nhân viên hỗ trợ.');
export const SupportProfile = createScreen('SupportProfile', 'Hồ sơ hỗ trợ.');
export const AdminDashboard = createScreen('AdminDashboard', 'Bảng điều khiển quản trị.');
export const ParkingLotConfig = createScreen('ParkingLotConfig', 'Cấu hình bãi đỗ.');
export const Statistics = createScreen('Statistics', 'Thống kê hệ thống.');
export const ServiceSubscription = createScreen('ServiceSubscription', 'Đăng ký dịch vụ.');
export const CommunityModeration = createScreen('CommunityModeration', 'Kiểm duyệt cộng đồng.');
export const ShiftVideoLogs = createScreen('ShiftVideoLogs', 'Lịch sử video ca.');
export const StaffManagement = createScreen('StaffManagement', 'Quản lý nhân sự.');
export const MyParkingLots = createScreen('MyParkingLots', 'Bãi đỗ của tôi.');
export const ServiceRegistration = createScreen('ServiceRegistration', 'Đăng ký dịch vụ.');
export const CameraManagement = createScreen('CameraManagement', 'Quản lý camera.');
export const AdminPinSecurity = createScreen('AdminPinSecurity', 'Bảo mật mã PIN.');
export const ParkingLotEditPage = createScreen('ParkingLotEditPage', 'Chỉnh sửa bãi đỗ.');
export const ParkingLotDetailsPage = createScreen('ParkingLotDetailsPage', 'Chi tiết bãi đỗ đã chỉnh sửa.');
export const ProviderDashboard = createScreen('ProviderDashboard', 'Bảng điều khiển nhà cung cấp.');
export const VirtualCoinSettings = createScreen('VirtualCoinSettings', 'Cài đặt xu ảo.');
export const ServiceManagement = createScreen('ServiceManagement', 'Quản lý dịch vụ.');
export const DeviceManagement = createScreen('DeviceManagement', 'Quản lý thiết bị.');
export const AccountManagement = createScreen('AccountManagement', 'Quản lý tài khoản.');
export const ProviderStatistics = createScreen('ProviderStatistics', 'Thống kê nhà cung cấp.');
export const SystemSettings = createScreen('SystemSettings', 'Cài đặt hệ thống.');
export const PackageManagement = createScreen('PackageManagement', 'Quản lý gói.');
export const MaintenanceSchedule = createScreen('MaintenanceSchedule', 'Lịch bảo trì.');
export const VehicleVerify = createScreen('VehicleVerify', 'Xác minh phương tiện.');
export const CommunityFeed = createScreen('CommunityFeed', 'Bảng tin cộng đồng.');
export const ParkingReviews = createScreen('ParkingReviews', 'Đánh giá bãi đỗ.');
export const TheftReportPage = createScreen('TheftReportPage', 'Báo cáo trộm cắp.');
export const SupportPage = createScreen('SupportPage', 'Trang hỗ trợ cộng đồng.');
export const CoinGames = createScreen('CoinGames', 'Trò chơi đổi xu.');
export const NotFound = createScreen('NotFound', 'Trang không tìm thấy.');

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  inner: {
    width: '100%',
    maxWidth: 640,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
});
