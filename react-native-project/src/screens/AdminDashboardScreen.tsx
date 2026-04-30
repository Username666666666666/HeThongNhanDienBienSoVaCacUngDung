import { useAuth } from '../context/AuthContext';
import { DashboardTemplate } from '../components/DashboardTemplate';

export const AdminDashboardScreen = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Người dùng', value: '1,234' },
    { label: 'Bãi đỗ', value: '89' },
    { label: 'Camera', value: '456' },
  ];

  const actions = [
    {
      title: 'Quản lý người dùng',
      description: 'Theo dõi và phân quyền tài khoản người dùng.',
      onPress: () => console.log('Navigate to User Management'),
    },
    {
      title: 'Quản lý bãi đỗ',
      description: 'Điều hành toàn bộ bãi đỗ trong hệ thống.',
      onPress: () => console.log('Navigate to Parking Lot Management'),
    },
    {
      title: 'Báo cáo hệ thống',
      description: 'Xem báo cáo hiệu suất và trạng thái hệ thống.',
      onPress: () => console.log('Navigate to System Reports'),
    },
    {
      title: 'Cộng đồng',
      description: 'Giám sát nội dung và phản hồi cộng đồng.',
      onPress: () => console.log('Navigate to Community Moderation'),
    },
    {
      title: 'PIN bảo mật',
      description: 'Quản lý cấu hình PIN bảo mật của hệ thống.',
      onPress: () => console.log('Navigate to PIN Security'),
    },
  ];

  return (
    <DashboardTemplate
      title="Bảng điều khiển Quản trị viên"
      welcome={`Xin chào, ${user?.name}!`}
      stats={stats}
      actions={actions}
    />
  );
};
