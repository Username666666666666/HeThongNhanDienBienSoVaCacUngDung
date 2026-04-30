import { useAuth } from '../context/AuthContext';
import { DashboardTemplate } from '../components/DashboardTemplate';

export const SupervisorDashboardScreen = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Bãi đỗ quản lý', value: '25' },
    { label: 'Camera hoạt động', value: '156' },
    { label: 'Doanh thu hôm nay', value: '2.5M' },
  ];

  const actions = [
    {
      title: 'Quản lý bãi đỗ',
      description: 'Xem và quản lý tất cả bãi đỗ được giám sát.',
      onPress: () => console.log('Navigate to Manage Parking Lots'),
    },
    {
      title: 'Giám sát camera',
      description: 'Xem luồng camera và nhận diện phương tiện.',
      onPress: () => console.log('Navigate to Camera Monitoring'),
    },
    {
      title: 'Báo cáo doanh thu',
      description: 'Theo dõi doanh thu và xu hướng vận hành.',
      onPress: () => console.log('Navigate to Revenue Reports'),
    },
    {
      title: 'Nhân viên',
      description: 'Kiểm soát quyền và nhiệm vụ của đội ngũ.',
      onPress: () => console.log('Navigate to Staff Management'),
    },
  ];

  return (
    <DashboardTemplate
      title="Bảng điều khiển Giám sát viên"
      welcome={`Xin chào, ${user?.name}!`}
      stats={stats}
      actions={actions}
    />
  );
};
