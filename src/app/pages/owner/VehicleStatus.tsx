import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  BellRing,
  Car,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  FileText,
  MapPin,
  Navigation,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  User,
  Search,
  CircleAlert,
  ParkingCircle,
  Image as ImageIcon,
  LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

type VerifyStatus = 'Đang xác thực' | 'Đã duyệt' | 'Xác thực thất bại';
type ParkStatus = 'parked' | 'available';

type VehicleRow = {
  id: number;
  plate: string;
  type: string;
  ownerName: string;
  phone: string;
  cccd: string;
  license?: string | null;
  brand: string;
  color: string;
  verifyStatus: VerifyStatus;
  parkingStatus: ParkStatus;
  parkingLot: string;
  location: string;
  entryTime?: string;
  entryDate?: string;
  duration?: string;
  currentFee?: string;
  entryImage?: string;
  frontImage?: string;
  backImage?: string;
  driverImage?: string;
  verifyReason?: string;
  createdAt: string;
};

const mockVehicles: VehicleRow[] = [
  {
    id: 1,
    plate: '30A-12345',
    type: 'Xe ô tô',
    ownerName: 'Nguyễn Văn A',
    phone: '0901 234 567',
    cccd: '012345678901',
    license: 'B2-123456',
    brand: 'Toyota Vios',
    color: 'Trắng',
    verifyStatus: 'Đã duyệt',
    parkingStatus: 'parked',
    parkingLot: 'Bãi đỗ xe A',
    location: 'Vị trí A015 - Sân A',
    entryTime: '08:30 AM',
    entryDate: '30/03/2026',
    duration: '2 giờ 30 phút',
    currentFee: '50.000đ',
    entryImage: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=1200',
    frontImage: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=1200',
    backImage: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=1200',
    driverImage: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=1200',
    createdAt: '2026-03-30T08:25:00.000Z',
  },
  {
    id: 2,
    plate: '29B-67890',
    type: 'Xe máy',
    ownerName: 'Trần Thị B',
    phone: '0912 345 678',
    cccd: '123456789012',
    license: null,
    brand: 'Honda Wave',
    color: 'Đỏ',
    verifyStatus: 'Đang xác thực',
    parkingStatus: 'available',
    parkingLot: '-',
    location: '-',
    createdAt: '2026-04-01T10:15:00.000Z',
    frontImage: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200',
    backImage: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200',
    driverImage: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200',
  },
  {
    id: 3,
    plate: '51C-24680',
    type: 'Xe ô tô',
    ownerName: 'Lê Minh C',
    phone: '0933 222 111',
    cccd: '098765432101',
    license: 'B1-889900',
    brand: 'Kia Morning',
    color: 'Xanh',
    verifyStatus: 'Xác thực thất bại',
    parkingStatus: 'available',
    parkingLot: '-',
    location: '-',
    verifyReason: 'Ảnh CCCD mặt sau bị mờ, chưa thấy rõ thông tin.',
    createdAt: '2026-03-28T14:00:00.000Z',
    frontImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200',
    backImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200',
    driverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200',
  },
  {
    id: 4,
    plate: '43D-13579',
    type: 'Xe máy',
    ownerName: 'Phạm Thị D',
    phone: '0988 777 666',
    cccd: '111122223333',
    license: 'A1-445566',
    brand: 'Yamaha Sirius',
    color: 'Đen',
    verifyStatus: 'Đã duyệt',
    parkingStatus: 'available',
    parkingLot: '-',
    location: '-',
    createdAt: '2026-03-20T09:00:00.000Z',
    frontImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200',
    backImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200',
    driverImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200',
  },
];

const statusVerifyMeta: Record<
  VerifyStatus,
  { label: string; badge: string; icon: LucideIcon; tint: string }
> = {
  'Đang xác thực': {
    label: 'Đang xác thực',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock3,
    tint: 'from-amber-500 to-orange-500',
  },
  'Đã duyệt': {
    label: 'Đã duyệt',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    tint: 'from-emerald-500 to-green-500',
  },
  'Xác thực thất bại': {
    label: 'Xác thực thất bại',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: TriangleAlert,
    tint: 'from-red-500 to-rose-500',
  },
};

const getParkingBadge = (status: ParkStatus) =>
  status === 'parked'
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-gray-100 text-gray-700 border-gray-200';

export const VehicleStatus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [verifyFilter, setVerifyFilter] = useState<'all' | VerifyStatus>('all');
  const [viewMode, setViewMode] = useState<'all' | 'verify' | 'parking'>('all');
  const [vehicles, setVehicles] = useState<VehicleRow[]>(mockVehicles);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedId) || vehicles[0] || null,
    [selectedId, vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return vehicles.filter((v) => {
      const matchesView =
        viewMode === 'all'
          ? true
          : viewMode === 'verify'
            ? true
            : true;

      const matchesStatus =
        verifyFilter === 'all' ? true : v.verifyStatus === verifyFilter;

      const haystack = [
        v.plate,
        v.type,
        v.ownerName,
        v.phone,
        v.cccd,
        v.license || '',
        v.brand,
        v.color,
        v.parkingLot,
        v.location,
        v.verifyStatus,
        v.parkingStatus,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = q ? haystack.includes(q) : true;

      return matchesView && matchesStatus && matchesSearch;
    });
  }, [vehicles, search, verifyFilter, viewMode]);

  const verifyVehicles = useMemo(
    () => vehicles.filter((v) => v.verifyStatus !== 'Đã duyệt'),
    [vehicles],
  );

  const parkedVehicles = useMemo(
    () => vehicles.filter((v) => v.parkingStatus === 'parked'),
    [vehicles],
  );

  const approvedVehicles = useMemo(
    () => vehicles.filter((v) => v.verifyStatus === 'Đã duyệt'),
    [vehicles],
  );

  const pendingVehicles = useMemo(
    () => vehicles.filter((v) => v.verifyStatus === 'Đang xác thực'),
    [vehicles],
  );

  const failedVehicles = useMemo(
    () => vehicles.filter((v) => v.verifyStatus === 'Xác thực thất bại'),
    [vehicles],
  );

  const handleNavigate = () => {
    toast.success('Đang mở bản đồ chỉ đường...');
  };

  const handleDelete = () => {
    if (!selectedVehicle) return;

    toast.message('Đã xóa phương tiện', {
      description:
        'Phương tiện sẽ phải đăng ký và xác thực lại từ đầu. Quá trình xác thực có thể kéo dài từ 1 đến 12 ngày.',
    });

    setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle.id));
    const remain = vehicles.filter((v) => v.id !== selectedVehicle.id);
    setSelectedId(remain[0]?.id || 0);
  };

  const handleViewImages = () => {
    toast.success('Đã mở chi tiết hình ảnh phương tiện.');
  };

  const handleRefresh = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 450);
    toast.success('Đã làm mới dữ liệu.');
  };

  const badgeClass = (status: VerifyStatus) => statusVerifyMeta[status].badge;
  const badgeIcon = (status: VerifyStatus) => statusVerifyMeta[status].icon;

  const DocCard = ({
    label,
    src,
    icon: Icon,
  }: {
    label: string;
    src?: string | null;
    icon: LucideIcon;
  }) => (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <div className="text-sm font-semibold text-gray-900">{label}</div>
        </div>
        {src ? (
          <button
            onClick={handleViewImages}
            className="text-xs text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
          >
            Xem
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-xs text-gray-400">Trống</span>
        )}
      </div>
      <div className="p-4 bg-gray-50">
        {src ? (
          <img
            src={src}
            alt={label}
            className="w-full h-52 object-cover rounded-xl border border-gray-200 bg-white"
          />
        ) : (
          <div className="w-full h-52 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400 text-sm">
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/owner')}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl mb-1 flex items-center gap-3">
                  <Car className="w-8 h-8" />
                  Trạng thái phương tiện
                </h1>
                <p className="text-slate-200 text-sm">
                  Quản lý xác thực, xem chi tiết hình ảnh và trạng thái đỗ xe của tất cả phương tiện
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="text-sm">Làm mới</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Tổng phương tiện</div>
              <div className="text-3xl font-bold">{vehicles.length}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Đã duyệt</div>
              <div className="text-3xl font-bold">{approvedVehicles.length}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Đang xác thực</div>
              <div className="text-3xl font-bold">{pendingVehicles.length}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Xác thực thất bại</div>
              <div className="text-3xl font-bold">{failedVehicles.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Danh sách phương tiện</h3>
                  <div className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {loading ? 'Đang tải...' : `${filteredVehicles.length} mục`}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm theo biển số, tên, CCCD..."
                      className="w-full rounded-2xl border border-gray-300 pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'Đang xác thực', label: 'Đang xác thực' },
                      { key: 'Đã duyệt', label: 'Đã duyệt' },
                      { key: 'Xác thực thất bại', label: 'Thất bại' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setVerifyFilter(item.key as any)}
                        className={`px-3 py-2 rounded-xl text-sm border transition ${
                          verifyFilter === item.key
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-slate-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'all', label: 'Tổng quan' },
                      { key: 'verify', label: 'Xác thực' },
                      { key: 'parking', label: 'Đỗ xe' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setViewMode(item.key as any)}
                        className={`px-3 py-2 rounded-xl text-sm border transition ${
                          viewMode === item.key
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-h-[72vh] overflow-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">Không có phương tiện phù hợp</div>
                ) : (
                  filteredVehicles.map((v) => {
                    const StatusIcon = statusVerifyMeta[v.verifyStatus].icon;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedId(v.id)}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                          selectedVehicle?.id === v.id ? 'bg-slate-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-sm">
                              <Car className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{v.plate}</div>
                              <div className="text-sm text-gray-600 truncate">
                                {v.type} · {v.ownerName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {v.brand} · {v.color}
                              </div>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${badgeClass(
                                    v.verifyStatus,
                                  )}`}
                                >
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {v.verifyStatus}
                                </span>
                                <span
                                  className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${getParkingBadge(
                                    v.parkingStatus,
                                  )}`}
                                >
                                  {v.parkingStatus === 'parked' ? 'Đang đỗ' : 'Chưa đỗ'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lưu ý cho người dùng</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3">
                  <CircleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    Phương tiện bị xóa sẽ phải xác thực lại từ đầu. Thời gian xác thực có thể kéo
                    dài từ 1 đến 12 ngày.
                  </p>
                </div>
                <div className="flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p>Người dùng chỉ xem được chi tiết hình ảnh của phương tiện thuộc sở hữu của mình.</p>
                </div>
                <div className="flex gap-3">
                  <Ban className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p>Không được phép thay đổi dữ liệu hồ sơ nếu không có quyền quản trị.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8">
            {!selectedVehicle ? (
              <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-gray-500">
                Chưa có phương tiện nào được chọn
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-sm">
                          {React.createElement(badgeIcon(selectedVehicle.verifyStatus), { className: 'w-6 h-6' })}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedVehicle.plate}</h2>
                          <p className="text-sm text-gray-500">
                            Mã người dùng: {selectedVehicle.ownerName} · {selectedVehicle.createdAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${badgeClass(
                            selectedVehicle.verifyStatus,
                          )}`}
                        >
                          {selectedVehicle.verifyStatus}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${getParkingBadge(
                            selectedVehicle.parkingStatus,
                          )}`}
                        >
                          {selectedVehicle.parkingStatus === 'parked' ? 'Đang đỗ' : 'Chưa đỗ'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleNavigate}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                      >
                        <Navigation className="w-5 h-5" />
                        Chỉ đường đến xe
                      </button>
                      <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                      >
                        <Trash2 className="w-5 h-5" />
                        Xóa phương tiện
                      </button>
                    </div>
                  </div>

                  {selectedVehicle.verifyStatus === 'Xác thực thất bại' && (
                    <div className="mt-5 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-start gap-3">
                      <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700">
                        <div className="font-semibold mb-1">Xác thực thất bại</div>
                        <div>
                          {selectedVehicle.verifyReason ||
                            'Hồ sơ hiện đang bị đánh dấu thất bại. Vui lòng kiểm tra lại hình ảnh và tiến hành xác thực lại từ đầu.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Thông tin chủ xe
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Họ tên</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.ownerName}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Số điện thoại</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.phone}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">CCCD</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.cccd}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">GPLX</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.license || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Ngày tạo</span>
                        <span className="font-medium text-gray-900 text-right">
                          {new Date(selectedVehicle.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Thông tin phương tiện
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Loại xe</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.type}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Hãng xe</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.brand}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Màu xe</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.color}</span>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
                        <span className="text-gray-500">Biển số</span>
                        <span className="font-medium text-gray-900 text-right">{selectedVehicle.plate}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Khu vực hiển thị</span>
                        <span className="font-medium text-gray-900 text-right">
                          {selectedVehicle.parkingStatus === 'parked' ? 'Bảng đỗ xe' : 'Chưa đỗ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5" />
                        Miền xác thực phương tiện
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${badgeClass(
                          selectedVehicle.verifyStatus,
                        )}`}
                      >
                        {selectedVehicle.verifyStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocCard label="Ảnh CCCD mặt trước" src={selectedVehicle.frontImage} icon={FileText} />
                      <DocCard label="Ảnh CCCD mặt sau" src={selectedVehicle.backImage} icon={FileText} />
                      <DocCard label="Ảnh người lái xe" src={selectedVehicle.driverImage} icon={User} />
                      <DocCard label="Ảnh đăng ký hồ sơ" src={selectedVehicle.entryImage} icon={ImageIcon} />
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ParkingCircle className="w-5 h-5" />
                        Miền trạng thái đỗ xe
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${getParkingBadge(
                          selectedVehicle.parkingStatus,
                        )}`}
                      >
                        {selectedVehicle.parkingStatus === 'parked' ? 'Đang đỗ' : 'Chưa đỗ'}
                      </span>
                    </div>

                    {selectedVehicle.parkingStatus === 'parked' ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-4 bg-gray-50 rounded-2xl">
                            <div className="text-sm text-gray-500 mb-1">Bãi đỗ</div>
                            <div className="text-gray-900 font-medium">{selectedVehicle.parkingLot}</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-2xl">
                            <div className="text-sm text-gray-500 mb-1">Vị trí</div>
                            <div className="text-gray-900 font-medium">{selectedVehicle.location}</div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-2xl">
                            <div className="text-sm text-gray-500 mb-1">Giờ vào</div>
                            <div className="text-gray-900 font-medium">
                              {selectedVehicle.entryTime} - {selectedVehicle.entryDate}
                            </div>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-2xl">
                            <div className="text-sm text-gray-500 mb-1">Thời gian đỗ</div>
                            <div className="text-gray-900 font-medium">{selectedVehicle.duration}</div>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
                          <div>
                            <div className="text-sm text-blue-600">Phí hiện tại</div>
                            <div className="text-2xl font-bold text-blue-700">
                              {selectedVehicle.currentFee || '0đ'}
                            </div>
                          </div>
                          <Clock3 className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="mt-4">
                          <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-3xl h-64 flex items-center justify-center border border-gray-200">
                            <div className="text-center px-4">
                              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-700 font-medium">
                                Sơ đồ bãi đỗ - {selectedVehicle.location}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Dữ liệu mock tạm thời, sẵn sàng thay bằng dữ liệu thật
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleNavigate}
                          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Navigation className="w-5 h-5" />
                          Chỉ đường đến xe
                        </button>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">Xe chưa đỗ</h4>
                        <p className="text-gray-600 mb-6">
                          Phương tiện này chưa được đỗ tại bãi nào. Bạn vẫn có thể xem hồ sơ và
                          hình ảnh xác thực của xe.
                        </p>
                        <button
                          onClick={() => navigate('/owner/register-vehicle')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition"
                        >
                          Đăng ký đỗ xe
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-amber-500" />
                        Quy định khi xóa phương tiện
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>
                          Khi xóa phương tiện, hồ sơ sẽ bị loại khỏi danh sách hiện tại và phải đăng
                          ký lại từ đầu.
                        </p>
                        <p>
                          Hệ thống sẽ giữ nguyên trải nghiệm người dùng bằng thông báo rõ ràng: quá
                          trình xác thực lại có thể kéo dài từ <strong>1 đến 12 ngày</strong>.
                        </p>
                        <p>
                          Nếu hồ sơ trước đó đang ở trạng thái <strong>Xác thực thất bại</strong>,
                          người dùng có thể xóa để tạo hồ sơ mới hoàn chỉnh hơn.
                        </p>
                      </div>
                    </div>

                    <div className="lg:w-[280px]">
                      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                        <div className="font-semibold mb-1">Thông báo hệ thống</div>
                        <div>
                          Vui lòng chuẩn bị lại ảnh CCCD, GPLX, giấy đăng ký xe và ảnh chân dung rõ
                          nét để xác thực nhanh hơn.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};