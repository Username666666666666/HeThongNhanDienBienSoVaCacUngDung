import { ScrollView, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

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

// Tab Screens
export const VehiclesTab = () => {
  const navigation = useNavigation();
  const vehicleActions = [
    { title: 'Đăng ký xe', screen: 'RegisterVehicle' },
    { title: 'Trạng thái xe', screen: 'VehicleStatus' },
    { title: 'Lịch sử ra vào', screen: 'OwnerVehicleEntryExitLog' },
  ];

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Quản lý xe</Text>
      <FlatList
        data={vehicleActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Button
              title={item.title}
              onPress={() => navigation.navigate(item.screen)}
              size="large"
            />
          </Card>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export const ParkingTab = () => {
  const navigation = useNavigation();
  const parkingActions = [
    { title: 'Duyệt bãi đỗ', screen: 'BrowseParkingLots' },
    { title: 'Đăng ký gửi xe', screen: 'ParkingRegistration' },
    { title: 'Nạp xu', screen: 'TopUpCoins' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đỗ xe</Text>
      <FlatList
        data={parkingActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const CommunityTab = () => {
  const navigation = useNavigation();
  const communityActions = [
    { title: 'Tin tức cộng đồng', screen: 'CommunityFeed' },
    { title: 'Đánh giá bãi đỗ', screen: 'ParkingReviews' },
    { title: 'Báo cáo trộm cắp', screen: 'TheftReportPage' },
    { title: 'Chat cộng đồng', screen: 'CommunityChat' },
    { title: 'Trò chơi xu', screen: 'CoinGames' },
    { title: 'Hỗ trợ', screen: 'SupportPage' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cộng đồng</Text>
      <FlatList
        data={communityActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const MonitoringTab = () => {
  const navigation = useNavigation();
  const monitoringActions = [
    { title: 'Quản lý cổng', screen: 'GateManagement' },
    { title: 'Giám sát cổng đôi', screen: 'DualGateMonitoring' },
    { title: 'Xe nghi vấn', screen: 'SuspiciousVehicles' },
    { title: 'Lịch sử nghi vấn', screen: 'SuspiciousHistory' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giám sát</Text>
      <FlatList
        data={monitoringActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const ManagementTab = () => {
  const navigation = useNavigation();
  const managementActions = [
    { title: 'Quản lý ca', screen: 'ShiftManagement' },
    { title: 'Lịch sử ra vào', screen: 'SupervisorVehicleEntryExitLog' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý</Text>
      <FlatList
        data={managementActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const AdminManagementTab = () => {
  const navigation = useNavigation();
  const managementActions = [
    { title: 'Cấu hình bãi đỗ', screen: 'ParkingLotConfig' },
    { title: 'Đăng ký dịch vụ', screen: 'ServiceSubscription' },
    { title: 'Kiểm duyệt cộng đồng', screen: 'CommunityModeration' },
    { title: 'Video ca làm', screen: 'ShiftVideoLogs' },
    { title: 'Quản lý nhân sự', screen: 'StaffManagement' },
    { title: 'Bãi đỗ của tôi', screen: 'MyParkingLots' },
    { title: 'Đăng ký dịch vụ', screen: 'ServiceRegistration' },
    { title: 'Quản lý camera', screen: 'CameraManagement' },
    { title: 'Bảo mật PIN', screen: 'AdminPinSecurity' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý</Text>
      <FlatList
        data={managementActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const ProviderServicesTab = () => {
  const navigation = useNavigation();
  const servicesActions = [
    { title: 'Cài đặt xu ảo', screen: 'VirtualCoinSettings' },
    { title: 'Quản lý dịch vụ', screen: 'ServiceManagement' },
    { title: 'Xác minh xe', screen: 'VehicleVerify' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dịch vụ</Text>
      <FlatList
        data={servicesActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export const ProviderManagementTab = () => {
  const navigation = useNavigation();
  const managementActions = [
    { title: 'Quản lý thiết bị', screen: 'DeviceManagement' },
    { title: 'Quản lý tài khoản', screen: 'AccountManagement' },
    { title: 'Cài đặt hệ thống', screen: 'SystemSettings' },
    { title: 'Quản lý gói', screen: 'PackageManagement' },
    { title: 'Lịch bảo trì', screen: 'MaintenanceSchedule' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý</Text>
      <FlatList
        data={managementActions}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Existing screens
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
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
