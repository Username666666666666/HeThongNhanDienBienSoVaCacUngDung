import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { DashboardTemplate } from '../components/DashboardTemplate';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'RoleDashboard'>;

export const RoleDashboardScreen = ({ route }: ScreenProps) => {
  const { user } = useAuth();
  const role = route.params.role || 'owner';

  const descriptions: Record<string, string> = {
    owner: 'Quản lý đăng ký, gửi xe và theo dõi trạng thái bãi đỗ của bạn.',
    supervisor: 'Giám sát cổng, kiểm tra phương tiện và đảm bảo an ninh.',
    admin: 'Quản lý dữ liệu, giám sát dịch vụ và cấu hình hệ thống.',
    provider: 'Quản lý thiết bị, dịch vụ và bộ phận bảo trì.',
    support: 'Hỗ trợ cộng đồng và xử lý yêu cầu khách hàng.',
  };

  const actions = [
    {
      title: 'Cộng đồng',
      description: 'Đi tới trang cộng đồng để trao đổi và hỗ trợ.',
      onPress: () => console.log('Navigate to Community'),
    },
    {
      title: 'Hồ sơ',
      description: 'Xem thông tin tài khoản và trạng thái hiện tại.',
      onPress: () => console.log('Navigate to Profile'),
    },
  ];

  return (
    <DashboardTemplate
      title={`${role.toUpperCase()} Dashboard`}
      welcome={`Xin chào, ${user?.name}!`}
      stats={[{ label: 'Vai trò', value: role.toUpperCase() }]}
      actions={actions}
    />
  );
};
