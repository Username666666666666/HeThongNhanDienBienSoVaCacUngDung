import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface PackageData {
  id: string;
  name: string;
  staffLimit: string;
  price: number;
  features: string[];
  deviceDiscount?: number;
  maintenanceDiscount?: number;
}

export const PackageManagement = () => {
  const navigate = useNavigate();
  const [editingPackage, setEditingPackage] = useState<string | null>(null);

  const [packages, setPackages] = useState<PackageData[]>([
    {
      id: 'basic',
      name: 'Cơ bản',
      staffLimit: '3-5 nhân viên',
      price: 299000,
      deviceDiscount: 10,
      maintenanceDiscount: 15,
      features: [
        'Quản lý cơ bản',
        'Camera giám sát (tối đa 2)',
        'Báo cáo cơ bản',
        'Hỗ trợ email',
        'Tự bảo trì thiết bị',
      ],
    },
    {
      id: 'standard',
      name: 'Tiêu chuẩn',
      staffLimit: '10-15 nhân viên',
      price: 699000,
      deviceDiscount: 20,
      maintenanceDiscount: 30,
      features: [
        'Tất cả tính năng Cơ bản',
        'Camera giám sát (tối đa 10)',
        'Báo cáo nâng cao',
        'Hỗ trợ 24/7',
        'Bảo trì định kỳ 6 tháng/lần',
      ],
    },
    {
      id: 'premium',
      name: 'Cao cấp',
      staffLimit: 'Không giới hạn',
      price: 1499000,
      deviceDiscount: 30,
      maintenanceDiscount: 50,
      features: [
        'Tất cả tính năng Tiêu chuẩn',
        'Không giới hạn nhân viên',
        'Camera không giới hạn',
        'Bảo trì định kỳ 3 tháng/lần',
        'Hỗ trợ ưu tiên 24/7',
        'Đào tạo miễn phí',
      ],
    },
  ]);

  const [tempPackage, setTempPackage] = useState<PackageData | null>(null);

  const handleEditClick = (pkg: PackageData) => {
    setEditingPackage(pkg.id);
    setTempPackage({ ...pkg });
  };

  const handleSave = () => {
    if (!tempPackage) return;

    setPackages(packages.map(pkg => pkg.id === tempPackage.id ? tempPackage : pkg));
    toast.success(`✅ Đã cập nhật gói ${tempPackage.name}!`);
    setEditingPackage(null);
    setTempPackage(null);
  };

  const handleCancel = () => {
    setEditingPackage(null);
    setTempPackage(null);
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
                Quản lý gói dịch vụ
              </h1>
              <p className="text-purple-100 text-sm">Cấu hình giá và tính năng các gói dịch vụ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isEditing = editingPackage === pkg.id;
            const displayPkg = isEditing && tempPackage ? tempPackage : pkg;

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition ${
                  pkg.id === 'premium'
                    ? 'border-yellow-400 ring-4 ring-yellow-100'
                    : 'border-gray-200'
                }`}
              >
                {pkg.id === 'premium' && (
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-2 text-center font-bold">
                    ⭐ KHUYẾN NGHỊ
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayPkg.name}</h3>
                    <div className="text-sm text-gray-600 mb-4">{displayPkg.staffLimit}</div>

                    {isEditing ? (
                      <div className="mb-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Giá (VNĐ/tháng)</label>
                        <input
                          type="number"
                          value={tempPackage?.price || 0}
                          onChange={(e) => setTempPackage({ ...tempPackage!, price: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-center text-2xl font-bold"
                        />
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {displayPkg.price.toLocaleString()}đ
                      </div>
                    )}
                    <div className="text-sm text-gray-500">/ tháng</div>
                  </div>

                  {pkg.deviceDiscount && pkg.maintenanceDiscount && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                      <div className="text-sm font-bold text-yellow-700 mb-2">Ưu đãi xu ảo</div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Giảm thiết bị (%)</label>
                            <input
                              type="number"
                              value={tempPackage?.deviceDiscount || 0}
                              onChange={(e) => setTempPackage({ ...tempPackage!, deviceDiscount: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Giảm bảo trì (%)</label>
                            <input
                              type="number"
                              value={tempPackage?.maintenanceDiscount || 0}
                              onChange={(e) => setTempPackage({ ...tempPackage!, maintenanceDiscount: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700">
                          • Giảm {displayPkg.deviceDiscount}% thiết bị<br />
                          • Giảm {displayPkg.maintenanceDiscount}% bảo trì
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-sm font-bold text-gray-700 mb-3">Tính năng:</div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {displayPkg.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 font-bold"
                      >
                        <X className="w-4 h-4" />
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2 font-bold shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Edit className="w-5 h-5" />
                      Chỉnh sửa giá
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};