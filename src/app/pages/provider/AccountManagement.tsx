import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Users, UserCheck, HeadphonesIcon, 
  Search, Filter, Edit, Trash2, Lock, Unlock
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  role: 'admin' | 'owner' | 'supervisor' | 'support';
  name: string;
  email: string;
  phone: string;
  parkingLot?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdDate: Date;
  lastLogin: Date;
}

export const AccountManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'owner' | 'supervisor' | 'support'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      role: 'admin',
      name: 'Nguyễn Văn A',
      email: 'admin1@parking.com',
      phone: '0901234567',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      status: 'active',
      createdDate: new Date('2024-01-15'),
      lastLogin: new Date('2026-04-16'),
    },
    {
      id: '2',
      role: 'admin',
      name: 'Trần Thị B',
      email: 'admin2@parking.com',
      phone: '0902345678',
      parkingLot: 'Bãi xe Thống Nhất',
      status: 'active',
      createdDate: new Date('2024-02-01'),
      lastLogin: new Date('2026-04-15'),
    },
    {
      id: '3',
      role: 'supervisor',
      name: 'Lê Văn C',
      email: 'supervisor1@parking.com',
      phone: '0903456789',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      status: 'active',
      createdDate: new Date('2024-03-10'),
      lastLogin: new Date('2026-04-16'),
    },
    {
      id: '4',
      role: 'supervisor',
      name: 'Phạm Thị D',
      email: 'supervisor2@parking.com',
      phone: '0904567890',
      parkingLot: 'Bãi xe Thống Nhất',
      status: 'active',
      createdDate: new Date('2024-03-15'),
      lastLogin: new Date('2026-04-16'),
    },
    {
      id: '5',
      role: 'support',
      name: 'Hoàng Văn E',
      email: 'support1@parking.com',
      phone: '0905678901',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      status: 'active',
      createdDate: new Date('2024-04-01'),
      lastLogin: new Date('2026-04-16'),
    },
    {
      id: '6',
      role: 'owner',
      name: 'Vũ Thị F',
      email: 'owner1@example.com',
      phone: '0906789012',
      status: 'active',
      createdDate: new Date('2025-06-20'),
      lastLogin: new Date('2026-04-16'),
    },
    {
      id: '7',
      role: 'owner',
      name: 'Đỗ Văn G',
      email: 'owner2@example.com',
      phone: '0907890123',
      status: 'inactive',
      createdDate: new Date('2025-08-15'),
      lastLogin: new Date('2026-03-10'),
    },
  ]);

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.phone.includes(searchTerm) ||
      (account.parkingLot?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesRole = filterRole === 'all' || account.role === filterRole;
    const matchesStatus = filterStatus === 'all' || account.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { name: 'Admin', icon: Shield, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'supervisor':
        return { name: 'Giám sát', icon: UserCheck, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'support':
        return { name: 'Hỗ trợ', icon: HeadphonesIcon, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'owner':
        return { name: 'Người dùng', icon: Users, color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
      default:
        return { name: role, icon: Users, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { name: 'Hoạt động', color: 'bg-green-100 text-green-700' };
      case 'inactive':
        return { name: 'Không hoạt động', color: 'bg-gray-100 text-gray-700' };
      case 'suspended':
        return { name: 'Tạm khóa', color: 'bg-red-100 text-red-700' };
      default:
        return { name: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleToggleStatus = (id: string) => {
    setAccounts(
      accounts.map((acc) => {
        if (acc.id === id) {
          const newStatus = acc.status === 'active' ? 'suspended' : 'active';
          return { ...acc, status: newStatus };
        }
        return acc;
      })
    );
    toast.success('✅ Đã cập nhật trạng thái tài khoản!');
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
    toast.success('🗑️ Đã xóa tài khoản!');
  };

  const stats = {
    total: accounts.length,
    admins: accounts.filter((a) => a.role === 'admin').length,
    supervisors: accounts.filter((a) => a.role === 'supervisor').length,
    support: accounts.filter((a) => a.role === 'support').length,
    owners: accounts.filter((a) => a.role === 'owner').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
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
                <Users className="w-8 h-8" />
                Quản lý tài khoản
              </h1>
              <p className="text-indigo-100 text-sm">Quản lý Admin, Người dùng, Giám sát, Hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Tổng tài khoản</div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Admin</div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.admins}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Giám sát</div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.supervisors}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Hỗ trợ</div>
              <div className="bg-green-100 p-3 rounded-xl">
                <HeadphonesIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.support}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Người dùng</div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.owners}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, email, SĐT, bãi đỗ..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Giám sát</option>
                <option value="support">Hỗ trợ</option>
                <option value="owner">Người dùng</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="space-y-4">
          {filteredAccounts.map((account) => {
            const roleInfo = getRoleInfo(account.role);
            const statusInfo = getStatusInfo(account.status);
            const RoleIcon = roleInfo.icon;

            return (
              <div
                key={account.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`${roleInfo.bgColor} p-4 rounded-xl`}>
                        <RoleIcon className={`w-6 h-6 ${roleInfo.textColor}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{account.name}</div>
                        <div className="text-sm text-gray-600">{account.email}</div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                      {statusInfo.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Vai trò</div>
                      <div className={`${roleInfo.bgColor} ${roleInfo.textColor} px-3 py-1 rounded-full text-sm font-semibold inline-block`}>
                        {roleInfo.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Số điện thoại</div>
                      <div className="font-semibold text-gray-900">{account.phone}</div>
                    </div>

                    {account.parkingLot && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Bãi đỗ</div>
                        <div className="font-semibold text-gray-900">{account.parkingLot}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Đăng nhập lần cuối</div>
                      <div className="text-sm text-gray-900">
                        {account.lastLogin.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="text-sm text-gray-600">
                      Ngày tạo: <span className="font-semibold text-gray-900">{account.createdDate.toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleToggleStatus(account.id)}
                      className={`flex-1 ${
                        account.status === 'active'
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold`}
                    >
                      {account.status === 'active' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      {account.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingAccount(account);
                        setShowEditModal(true);
                      }}
                      className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Edit className="w-5 h-5" />
                      Chỉnh sửa
                    </button>

                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Trash2 className="w-5 h-5" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy tài khoản</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chỉnh sửa vai trò</h2>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Tài khoản</div>
              <div className="text-xl font-bold text-gray-900">{editingAccount.name}</div>
              <div className="text-sm text-gray-600">{editingAccount.email}</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vai trò mới
              </label>
              <select
                value={editingAccount.role}
                onChange={(e) => setEditingAccount({ ...editingAccount, role: e.target.value as Account['role'] })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white"
              >
                <option value="admin">Admin</option>
                <option value="supervisor">Giám sát</option>
                <option value="support">Hỗ trợ</option>
                <option value="owner">Người dùng</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAccount(null);
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (editingAccount) {
                    setAccounts(accounts.map(acc => acc.id === editingAccount.id ? editingAccount : acc));
                    toast.success(`✅ Đã cập nhật vai trò thành ${getRoleInfo(editingAccount.role).name}!`);
                    setShowEditModal(false);
                    setEditingAccount(null);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold shadow-lg"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};