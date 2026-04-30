import { useAuth } from '../context/AuthContext';
import { DashboardTemplate } from '../components/DashboardTemplate';

export const SupportDashboardScreen = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Ticket đang mở', value: '8' },
    { label: 'Phản hồi hôm nay', value: '14' },
    { label: 'Đánh giá hài lòng', value: '98%' },
  ];

  const actions = [
    {
      title: 'Quản lý yêu cầu hỗ trợ',
      description: 'Xem và cập nhật trạng thái ticket của khách hàng.',
      onPress: () => console.log('Navigate to Support Ticket Queue'),
    },
    {
      title: 'Cộng đồng',
      description: 'Đi tới trang cộng đồng để hỗ trợ bài đăng và phản hồi.',
      onPress: () => console.log('Navigate to Community'),
    },
    {
      title: 'Chat nội bộ',
      description: 'Liên hệ nhanh với nhóm quản trị hoặc giám sát.',
      onPress: () => console.log('Navigate to Internal Chat'),
    },
    {
      title: 'Báo cáo lỗi',
      description: 'Ghi nhận sự cố hệ thống và gửi về nhóm kỹ thuật.',
      onPress: () => console.log('Navigate to Incident Report'),
    },
  ];

  return (
    <DashboardTemplate
      title="Bảng điều khiển Hỗ trợ"
      welcome={`Xin chào, ${user?.name}!`}
      stats={stats}
      actions={actions}
    />
  );
};
