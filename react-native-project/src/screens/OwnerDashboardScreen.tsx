import { useAuth } from '../context/AuthContext';
import { DashboardTemplate } from '../components/DashboardTemplate';

export const OwnerDashboardScreen = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Xu hiện tại', value: '150,000' },
    { label: 'Xe đã đăng ký', value: '3' },
    { label: 'Lần sử dụng', value: '12' },
  ];

  const actions = [
    {
      title: 'Đăng ký xe',
      description: 'Đăng ký phương tiện mới để sử dụng dịch vụ.',
      onPress: () => console.log('Navigate to Register Vehicle'),
    },
    {
      title: 'Tìm bãi đỗ',
      description: 'Tìm và đặt chỗ đỗ phù hợp với nhu cầu.',
      onPress: () => console.log('Navigate to Browse Parking Lots'),
    },
    {
      title: 'Trạng thái xe',
      description: 'Xem tình trạng và lịch sử xuất nhập.',
      onPress: () => console.log('Navigate to Vehicle Status'),
    },
    {
      title: 'Nạp xu',
      description: 'Nạp thêm xu để dùng các chức năng cao cấp.',
      onPress: () => console.log('Navigate to Top Up Coins'),
    },
  ];

  return (
    <DashboardTemplate
      title="Bảng điều khiển Chủ xe"
      welcome={`Xin chào, ${user?.name}!`}
      stats={stats}
      actions={actions}
    />
  );
};
