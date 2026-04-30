import { useAuth } from '../context/AuthContext';
import { DashboardTemplate } from '../components/DashboardTemplate';

export const ProviderDashboardScreen = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Bãi đỗ sở hữu', value: '5' },
    { label: 'Doanh thu tháng', value: '1.2M' },
    { label: 'Tỷ lệ lấp đầy', value: '98%' },
  ];

  const actions = [
    {
      title: 'Đăng ký dịch vụ',
      description: 'Thêm dịch vụ và cập nhật thông tin bãi đỗ.',
      onPress: () => console.log('Navigate to Service Registration'),
    },
    {
      title: 'Quản lý bãi đỗ',
      description: 'Giám sát danh sách và hoạt động bãi đỗ.',
      onPress: () => console.log('Navigate to My Parking Lots'),
    },
    {
      title: 'Cấu hình bãi đỗ',
      description: 'Thiết lập giá và điều kiện dịch vụ.',
      onPress: () => console.log('Navigate to Parking Lot Config'),
    },
    {
      title: 'Báo cáo doanh thu',
      description: 'Phân tích thu nhập và hiệu suất.',
      onPress: () => console.log('Navigate to Revenue Reports'),
    },
    {
      title: 'Quản lý camera',
      description: 'Cấu hình camera và giám sát hình ảnh.',
      onPress: () => console.log('Navigate to Camera Management'),
    },
  ];

  return (
    <DashboardTemplate
      title="Bảng điều khiển Nhà cung cấp"
      welcome={`Xin chào, ${user?.name}!`}
      stats={stats}
      actions={actions}
    />
  );
};
