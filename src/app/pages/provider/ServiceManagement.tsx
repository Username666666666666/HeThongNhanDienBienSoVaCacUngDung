import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building2, CheckCircle, 
  Calendar, DollarSign, Search, Filter, Package, Coins, XCircle 
} from 'lucide-react';

interface Subscription {
  id: string;
  parkingLotName: string;
  adminName: string;
  adminEmail: string;
  package: 'basic' | 'standard' | 'premium';
  hasVirtualCoin: boolean;
  maxStaff: number;
  currentStaff: number;
  startDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'pending';
  monthlyFee: number;
}

export const ServiceManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState<'all' | 'basic' | 'standard' | 'premium'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'pending'>('all');

  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      parkingLotName: 'Bãi đỗ xe Hùng Vương',
      adminName: 'Nguyễn Văn A',
      adminEmail: 'admin1@example.com',
      package: 'standard',
      hasVirtualCoin: true,
      maxStaff: 15,
      currentStaff: 8,
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      status: 'active',
      monthlyFee: 699000,
    },
    {
      id: '2',
      parkingLotName: 'Bãi xe Thống Nhất',
      adminName: 'Trần Thị B',
      adminEmail: 'admin2@example.com',
      package: 'premium',
      hasVirtualCoin: true,
      maxStaff: 999,
      currentStaff: 25,
      startDate: new Date('2025-06-01'),
      expiryDate: new Date('2026-06-01'),
      status: 'active',
      monthlyFee: 1499000,
    },
    {
      id: '3',
      parkingLotName: 'Bãi xe An Phú',
      adminName: 'Lê Văn C',
      adminEmail: 'admin3@example.com',
      package: 'basic',
      hasVirtualCoin: false,
      maxStaff: 5,
      currentStaff: 3,
      startDate: new Date('2026-03-01'),
      expiryDate: new Date('2027-03-01'),
      status: 'active',
      monthlyFee: 299000,
    },
    {
      id: '4',
      parkingLotName: 'Bãi đỗ Minh Khai',
      adminName: 'Phạm Thị D',
      adminEmail: 'admin4@example.com',
      package: 'standard',
      hasVirtualCoin: false,
      maxStaff: 15,
      currentStaff: 12,
      startDate: new Date('2025-12-01'),
      expiryDate: new Date('2026-03-01'),
      status: 'expired',
      monthlyFee: 699000,
    },
  ]);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.parkingLotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPackage = filterPackage === 'all' || sub.package === filterPackage;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;

    return matchesSearch && matchesPackage && matchesStatus;
  });

  const getPackageInfo = (pkg: string) => {
    switch (pkg) {
      case 'basic':
        return {
          name: 'Cơ bản',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
        };
      case 'standard':
        return {
          name: 'Tiêu chuẩn',
          color: 'from-purple-500 to-indigo-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
        };
      case 'premium':
        return {
          name: 'Cao cấp',
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
        };
      default:
        return {
          name: 'Không xác định',
          color: 'from-gray-500 to-slate-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { name: 'Hoạt động', color: 'bg-green-100 text-green-700' };
      case 'expired':
        return { name: 'Hết hạn', color: 'bg-red-100 text-red-700' };
      case 'pending':
        return { name: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { name: 'Không xác định', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
    totalRevenue: subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.monthlyFee, 0),
    withVirtualCoin: subscriptions.filter((s) => s.hasVirtualCoin).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/provider')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <Package className="w-8 h-8" />
                Quản lý dịch vụ
              </h1>
              <p className="text-purple-100 text-sm">
                Quản lý gói dịch vụ của các bãi đỗ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Tổng đăng ký</div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalSubscriptions}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Đang hoạt động</div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Có xu ảo</div>
              <Coins className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.withVirtualCoin}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Doanh thu/tháng</div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRevenue.toLocaleString()}đ
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tên bãi, admin, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gói dịch vụ</label>
              <select
                value={filterPackage}
                onChange={(e) => setFilterPackage(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="basic">Cơ bản</option>
                <option value="standard">Tiêu chuẩn</option>
                <option value="premium">Cao cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="expired">Hết hạn</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {filteredSubscriptions.map((sub) => {
            const packageInfo = getPackageInfo(sub.package);
            const statusInfo = getStatusInfo(sub.status);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-purple-300 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{sub.parkingLotName}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {statusInfo.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>👤 Admin: <span className="font-semibold">{sub.adminName}</span></div>
                      <div>📧 Email: <span className="font-semibold">{sub.adminEmail}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.hasVirtualCoin ? (
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 px-4 py-2 rounded-full flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <span className="font-bold text-yellow-700">Có xu ảo</span>
                      </div>
                    ) : (
                      <div className="bg-gray-100 border-2 border-gray-300 px-4 py-2 rounded-full flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-gray-600">Không có xu ảo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className={`${packageInfo.bgColor} p-4 rounded-xl border-2 border-${packageInfo.textColor.replace('text-', '')}`}>
                    <div className="text-xs text-gray-600 mb-1">Gói dịch vụ</div>
                    <div className={`text-lg font-bold ${packageInfo.textColor}`}>
                      {packageInfo.name}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
                    <div className="text-xs text-gray-600 mb-1">Nhân viên</div>
                    <div className="text-lg font-bold text-blue-700">
                      {sub.currentStaff} / {sub.maxStaff === 999 ? '∞' : sub.maxStaff}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-300">
                    <div className="text-xs text-gray-600 mb-1">Phí tháng</div>
                    <div className="text-lg font-bold text-green-700">
                      {sub.monthlyFee.toLocaleString()}đ
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-300">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Hết hạn
                    </div>
                    <div className="text-sm font-bold text-purple-700">
                      {sub.expiryDate.toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Ngày bắt đầu: {sub.startDate.toLocaleDateString('vi-VN')}
                </div>
              </div>
            );
          })}

          {filteredSubscriptions.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <div className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</div>
              <div className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
