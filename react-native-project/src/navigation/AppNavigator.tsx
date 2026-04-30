import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Screens from '../screens';
import { withRoleGuard } from '../components/GuardedScreen';

const Stack = createNativeStackNavigator();

const ROLE = {
  ALL: ['owner', 'supervisor', 'admin', 'provider', 'support'],
  OWNER: ['owner', 'supervisor', 'support'],
  SUPERVISOR: ['supervisor'],
  SUPPORT: ['support'],
  ADMIN: ['admin'],
  PROVIDER: ['provider'],
};

const routes = [
  { name: 'Register', component: Screens.Register, title: 'Đăng ký' },
  { name: 'Login', component: Screens.Login, title: 'Đăng nhập' },
  { name: 'ForgotPassword', component: Screens.ForgotPassword, title: 'Quên mật khẩu' },
  { name: 'AuthCallback', component: Screens.AuthCallback, title: 'Xác thực' },
  { name: 'Profile', component: withRoleGuard(Screens.Profile, ROLE.ALL), title: 'Hồ sơ' },
  { name: 'Community', component: withRoleGuard(Screens.Community, ROLE.ALL), title: 'Cộng đồng' },
  { name: 'CommunityFeed', component: withRoleGuard(Screens.CommunityFeed, ROLE.ALL), title: 'Tin tức cộng đồng' },
  { name: 'ParkingReviews', component: withRoleGuard(Screens.ParkingReviews, ROLE.ALL), title: 'Đánh giá' },
  { name: 'TheftReportPage', component: withRoleGuard(Screens.TheftReportPage, ROLE.ALL), title: 'Báo cáo trộm cắp' },
  { name: 'CommunityChat', component: withRoleGuard(Screens.CommunityChat, ROLE.ALL), title: 'Chat cộng đồng' },
  { name: 'CoinGames', component: withRoleGuard(Screens.CoinGames, ROLE.ALL), title: 'Trò chơi xu' },
  { name: 'SupportPage', component: withRoleGuard(Screens.SupportPage, ROLE.ALL), title: 'Hỗ trợ cộng đồng' },
  { name: 'InternalChatPage', component: withRoleGuard(Screens.InternalChatPage, ROLE.ALL), title: 'Chat nội bộ' },
  { name: 'ResetUserPin', component: withRoleGuard(Screens.ResetUserPin, ROLE.ALL), title: 'Đặt lại PIN' },
  { name: 'OwnerDashboard', component: withRoleGuard(Screens.OwnerDashboard, ROLE.OWNER), title: 'Bảng điều khiển chủ xe' },
  { name: 'RegisterVehicle', component: withRoleGuard(Screens.RegisterVehicle, ROLE.OWNER), title: 'Đăng ký xe' },
  { name: 'BrowseParkingLots', component: withRoleGuard(Screens.BrowseParkingLots, ROLE.OWNER), title: 'Duyệt bãi đỗ' },
  { name: 'ParkingLotDetails', component: withRoleGuard(Screens.ParkingLotDetails, ROLE.OWNER), title: 'Chi tiết bãi đỗ' },
  { name: 'ParkingZoneSelection', component: withRoleGuard(Screens.ParkingZoneSelection, ROLE.OWNER), title: 'Chọn vùng đỗ' },
  { name: 'VehicleTypeSelection', component: withRoleGuard(Screens.VehicleTypeSelection, ROLE.OWNER), title: 'Chọn loại xe' },
  { name: 'SpotSelection', component: withRoleGuard(Screens.SpotSelection, ROLE.OWNER), title: 'Chọn chỗ đỗ' },
  { name: 'VehicleStatus', component: withRoleGuard(Screens.VehicleStatus, ROLE.OWNER), title: 'Trạng thái xe' },
  { name: 'ParkingRegistration', component: withRoleGuard(Screens.ParkingRegistration, ROLE.OWNER), title: 'Đăng ký gửi xe' },
  { name: 'TopUpCoins', component: withRoleGuard(Screens.TopUpCoins, ROLE.OWNER), title: 'Nạp xu' },
  { name: 'OwnerVehicleEntryExitLog', component: withRoleGuard(Screens.OwnerVehicleEntryExitLog, ROLE.OWNER), title: 'Lịch sử ra vào' },
  { name: 'SupervisorDashboard', component: withRoleGuard(Screens.SupervisorDashboard, ROLE.SUPERVISOR), title: 'Giám sát' },
  { name: 'GateManagement', component: withRoleGuard(Screens.GateManagement, ROLE.SUPERVISOR), title: 'Quản lý cổng' },
  { name: 'DualGateMonitoring', component: withRoleGuard(Screens.DualGateMonitoring, ROLE.SUPERVISOR), title: 'Giám sát cổng đôi' },
  { name: 'SuspiciousVehicles', component: withRoleGuard(Screens.SuspiciousVehicles, ROLE.SUPERVISOR), title: 'Xe nghi vấn' },
  { name: 'SuspiciousHistory', component: withRoleGuard(Screens.SuspiciousHistory, ROLE.SUPERVISOR), title: 'Lịch sử nghi vấn' },
  { name: 'ShiftManagement', component: withRoleGuard(Screens.ShiftManagement, ROLE.SUPERVISOR), title: 'Quản lý ca' },
  { name: 'SupervisorVehicleEntryExitLog', component: withRoleGuard(Screens.SupervisorVehicleEntryExitLog, ROLE.SUPERVISOR), title: 'Lịch sử ra vào' },
  { name: 'SupervisorProfile', component: withRoleGuard(Screens.SupervisorProfile, ROLE.SUPERVISOR), title: 'Hồ sơ giám sát' },
  { name: 'SupportStaffDashboard', component: withRoleGuard(Screens.SupportStaffDashboard, ROLE.SUPPORT), title: 'Hỗ trợ' },
  { name: 'SupportProfile', component: withRoleGuard(Screens.SupportProfile, ROLE.SUPPORT), title: 'Hồ sơ hỗ trợ' },
  { name: 'AdminPinSecurity', component: withRoleGuard(Screens.AdminPinSecurity, ROLE.ADMIN), title: 'Bảo mật PIN' },
  { name: 'AdminDashboard', component: withRoleGuard(Screens.AdminDashboard, ROLE.ADMIN), title: 'Quản trị' },
  { name: 'ParkingLotConfig', component: withRoleGuard(Screens.ParkingLotConfig, ROLE.ADMIN), title: 'Cấu hình bãi đỗ' },
  { name: 'Statistics', component: withRoleGuard(Screens.Statistics, ROLE.ADMIN), title: 'Thống kê' },
  { name: 'ServiceSubscription', component: withRoleGuard(Screens.ServiceSubscription, ROLE.ADMIN), title: 'Đăng ký dịch vụ' },
  { name: 'CommunityModeration', component: withRoleGuard(Screens.CommunityModeration, ROLE.ADMIN), title: 'Kiểm duyệt cộng đồng' },
  { name: 'ShiftVideoLogs', component: withRoleGuard(Screens.ShiftVideoLogs, ROLE.ADMIN), title: 'Video ca làm' },
  { name: 'StaffManagement', component: withRoleGuard(Screens.StaffManagement, ROLE.ADMIN), title: 'Quản lý nhân sự' },
  { name: 'MyParkingLots', component: withRoleGuard(Screens.MyParkingLots, ROLE.ADMIN), title: 'Bãi đỗ của tôi' },
  { name: 'ServiceRegistration', component: withRoleGuard(Screens.ServiceRegistration, ROLE.ADMIN), title: 'Đăng ký dịch vụ' },
  { name: 'CameraManagement', component: withRoleGuard(Screens.CameraManagement, ROLE.ADMIN), title: 'Quản lý camera' },
  { name: 'ParkingLotEditPage', component: withRoleGuard(Screens.ParkingLotEditPage, ROLE.ADMIN), title: 'Chỉnh sửa bãi đỗ' },
  { name: 'ParkingLotDetailsPage', component: withRoleGuard(Screens.ParkingLotDetailsPage, ROLE.ADMIN), title: 'Chi tiết bãi đỗ' },
  { name: 'ProviderDashboard', component: withRoleGuard(Screens.ProviderDashboard, ROLE.PROVIDER), title: 'Nhà cung cấp' },
  { name: 'VirtualCoinSettings', component: withRoleGuard(Screens.VirtualCoinSettings, ROLE.PROVIDER), title: 'Cài đặt xu ảo' },
  { name: 'ServiceManagement', component: withRoleGuard(Screens.ServiceManagement, ROLE.PROVIDER), title: 'Quản lý dịch vụ' },
  { name: 'DeviceManagement', component: withRoleGuard(Screens.DeviceManagement, ROLE.PROVIDER), title: 'Quản lý thiết bị' },
  { name: 'AccountManagement', component: withRoleGuard(Screens.AccountManagement, ROLE.PROVIDER), title: 'Quản lý tài khoản' },
  { name: 'ProviderStatistics', component: withRoleGuard(Screens.ProviderStatistics, ROLE.PROVIDER), title: 'Thống kê nhà cung cấp' },
  { name: 'SystemSettings', component: withRoleGuard(Screens.SystemSettings, ROLE.PROVIDER), title: 'Cài đặt hệ thống' },
  { name: 'PackageManagement', component: withRoleGuard(Screens.PackageManagement, ROLE.PROVIDER), title: 'Quản lý gói' },
  { name: 'MaintenanceSchedule', component: withRoleGuard(Screens.MaintenanceSchedule, ROLE.PROVIDER), title: 'Lịch bảo trì' },
  { name: 'VehicleVerify', component: withRoleGuard(Screens.VehicleVerify, ROLE.PROVIDER), title: 'Xác minh xe' },
  { name: 'NotFound', component: Screens.NotFound, title: 'Không tìm thấy' },
];

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }} initialRouteName="Register">
      {routes.map((route) => (
        <Stack.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={{ title: route.title }}
        />
      ))}
    </Stack.Navigator>
  );
}
