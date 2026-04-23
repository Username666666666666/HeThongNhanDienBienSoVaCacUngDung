import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Car,
  CircleCheckBig,
  Clock3,
  FileText,
  Search,
  ShieldAlert,
  User,
  AlertTriangle,
  RefreshCcw,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

type VehicleRow = {
  id: string;
  manguoidung: string;
  maphuongtien: string;
  tenchuphuongtien: string;
  sodienthoai: string;
  socccd: string;
  sogplx: string | null;
  maloai: string;
  bienso: string;
  hangxe: string;
  mauxe: string;
  anhcccdmattruoc: string | null;
  anhcccdmatsau: string | null;
  anhgplx_mattruoc: string | null;
  anhgplx_matsau: string | null;
  anhgiaydangkyxe_mattruoc: string | null;
  anhgiaydangkyxe_matsau: string | null;
  anh_nguoi_dung: string | null;
  trang_thai_xac_thuc: string;
  created_at: string;
};

type UserRow = {
  manguoidung: string;
  email: string | null;
  tennguoidung: string | null;
  chucnang: string | null;
  mapinnguoidung: string | null;
};

type FailureRow = {
  id: string;
  noidung: string;
};

type PreviewMap = Record<string, string | null>;

export const VehicleVerify = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [users, setUsers] = useState<Record<string, UserRow>>({});
  const [failures, setFailures] = useState<Record<string, FailureRow>>({});
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Đang xác thực' | 'Đã duyệt' | 'Xác thực thất bại'>('Đang xác thực');
  const [rejectReason, setRejectReason] = useState('');
  const [previews, setPreviews] = useState<PreviewMap>({});

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedId) || vehicles[0] || null,
    [selectedId, vehicles]
  );

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();

    return vehicles.filter((v) => {
      const matchesStatus = statusFilter === 'all' ? true : v.trang_thai_xac_thuc === statusFilter;

      const haystack = [
        v.tenchuphuongtien,
        v.maphuongtien,
        v.bienso,
        v.hangxe,
        v.mauxe,
        v.sodienthoai,
        v.socccd,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = q ? haystack.includes(q) : true;

      return matchesStatus && matchesSearch;
    });
  }, [vehicles, search, statusFilter]);

  const loadPreviewUrl = async (path: string | null) => {
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from('PhuongTien')
      .createSignedUrl(path, 60 * 30);

    if (error) {
      console.warn('Preview signed url error:', error);
      return null;
    }

    return data.signedUrl || null;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: vehicleData, error: vehicleError }, { data: userData, error: userError }, { data: failureData, error: failureError }] =
        await Promise.all([
          supabase.from('phuongtien').select('*').order('created_at', { ascending: false }),
          supabase.from('nguoidung').select('manguoidung, email, tennguoidung, chucnang, mapinnguoidung'),
          supabase.from('xac_thuc_that_bai').select('id, noidung'),
        ]);

      if (vehicleError) throw vehicleError;
      if (userError) throw userError;
      if (failureError) throw failureError;

      const vehicleList = (vehicleData || []) as VehicleRow[];
      const userMap: Record<string, UserRow> = {};
      (userData || []).forEach((u) => {
        userMap[u.manguoidung] = u as UserRow;
      });

      const failureMap: Record<string, FailureRow> = {};
      (failureData || []).forEach((f) => {
        failureMap[f.id] = f as FailureRow;
      });

      setVehicles(vehicleList);
      setUsers(userMap);
      setFailures(failureMap);
      setSelectedId((prev) => prev || vehicleList[0]?.id || '');

      const previewEntries = await Promise.all(
        vehicleList.slice(0, 10).flatMap((v) => [
          ['anhcccdmattruoc', v.anhcccdmattruoc],
          ['anhcccdmatsau', v.anhcccdmatsau],
          ['anhgplx_mattruoc', v.anhgplx_mattruoc],
          ['anhgplx_matsau', v.anhgplx_matsau],
          ['anhgiaydangkyxe_mattruoc', v.anhgiaydangkyxe_mattruoc],
          ['anhgiaydangkyxe_matsau', v.anhgiaydangkyxe_matsau],
          ['anh_nguoi_dung', v.anh_nguoi_dung],
        ] as Array<[string, string | null]>).map(async ([key, path]) => [key, await loadPreviewUrl(path)] as const)
      );

      const previewMap: PreviewMap = {};
      previewEntries.forEach(([key, url]) => {
        previewMap[key] = url;
      });
      setPreviews(previewMap);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (vehicle: VehicleRow, status: string, reason?: string) => {
    setActionLoading(true);
    try {
      if (status === 'Đã duyệt') {
        const { error: updateError } = await supabase
          .from('phuongtien')
          .update({ trang_thai_xac_thuc: 'Đã duyệt' })
          .eq('id', vehicle.id);

        if (updateError) throw updateError;

        await supabase.from('xac_thuc_that_bai').delete().eq('id', vehicle.id);

        toast.success('Đã xác thực phương tiện thành công');
      } else {
        if (!reason?.trim()) {
          toast.error('Vui lòng nhập lý do thất bại');
          return;
        }

        const { error: upsertFailureError } = await supabase
          .from('xac_thuc_that_bai')
          .upsert(
            {
              id: vehicle.id,
              noidung: reason.trim(),
            },
            { onConflict: 'id' }
          );

        if (upsertFailureError) throw upsertFailureError;

        const { error: updateError } = await supabase
          .from('phuongtien')
          .update({ trang_thai_xac_thuc: 'Xác thực thất bại' })
          .eq('id', vehicle.id);

        if (updateError) throw updateError;

        toast.success('Đã cập nhật trạng thái thất bại và gửi lý do về tài khoản chủ xe');
      }

      await loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Cập nhật thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedUser = selectedVehicle ? users[selectedVehicle.manguoidung] : null;
  const selectedFailure = selectedVehicle ? failures[selectedVehicle.id] : null;

  const getStatusBadge = (status: string) => {
    if (status === 'Đã duyệt') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (status === 'Đang xác thực') {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (status === 'Xác thực thất bại') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const docs = selectedVehicle
    ? [
        { key: 'anhcccdmattruoc', label: 'CCCD mặt trước', path: selectedVehicle.anhcccdmattruoc },
        { key: 'anhcccdmatsau', label: 'CCCD mặt sau', path: selectedVehicle.anhcccdmatsau },
        { key: 'anhgplx_mattruoc', label: 'GPLX mặt trước', path: selectedVehicle.anhgplx_mattruoc },
        { key: 'anhgplx_matsau', label: 'GPLX mặt sau', path: selectedVehicle.anhgplx_matsau },
        { key: 'anhgiaydangkyxe_mattruoc', label: 'Đăng ký xe mặt trước', path: selectedVehicle.anhgiaydangkyxe_mattruoc },
        { key: 'anhgiaydangkyxe_matsau', label: 'Đăng ký xe mặt sau', path: selectedVehicle.anhgiaydangkyxe_matsau },
        { key: 'anh_nguoi_dung', label: 'Ảnh chân dung', path: selectedVehicle.anh_nguoi_dung },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => globalThis.location.replace('/provider')}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl mb-1 flex items-center gap-3">
                  <ShieldAlert className="w-8 h-8" />
                  Xác thực phương tiện
                </h1>
                <p className="text-slate-200 text-sm">
                  Kiểm tra hồ sơ, duyệt hoặc từ chối phương tiện của người dùng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <RefreshCcw className="w-5 h-5" />
                <span className="text-sm">Làm mới</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Chờ xử lý</div>
              <div className="text-3xl font-bold">{vehicles.filter((v) => v.trang_thai_xac_thuc === 'Đang xác thực').length}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Đã duyệt</div>
              <div className="text-3xl font-bold">{vehicles.filter((v) => v.trang_thai_xac_thuc === 'Đã duyệt').length}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="text-sm text-slate-200">Từ chối</div>
              <div className="text-3xl font-bold">{vehicles.filter((v) => v.trang_thai_xac_thuc === 'Xác thực thất bại').length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo biển số, tên, CCCD..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'Đang xác thực', label: 'Đang xác thực' },
                  { key: 'Đã duyệt', label: 'Đã duyệt' },
                  { key: 'Xác thực thất bại', label: 'Thất bại' },
                  { key: 'all', label: 'Tất cả' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key as any)}
                    className={`px-3 py-2 rounded-full text-sm border transition ${
                      statusFilter === item.key
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[72vh] overflow-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-6 text-center text-gray-500">Không có phương tiện phù hợp</div>
              ) : (
                filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                      selectedVehicle?.id === v.id ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-slate-900 text-white p-3 rounded-xl">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{v.tenchuphuongtien}</div>
                          <div className="text-sm text-gray-600">{v.bienso} · {v.hangxe}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {v.maphuongtien} · {users[v.manguoidung]?.tennguoidung || v.manguoidung}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(v.trang_thai_xac_thuc)}`}>
                        {v.trang_thai_xac_thuc}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-8">
            {!selectedVehicle ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
                Chưa có phương tiện nào được chọn
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-900 text-white p-3 rounded-xl">
                          <BadgeCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Hồ sơ phương tiện</h2>
                          <p className="text-sm text-gray-500">Mã phương tiện: {selectedVehicle.maphuongtien}</p>
                        </div>
                      </div>

                      <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm ${getStatusBadge(selectedVehicle.trang_thai_xac_thuc)}`}>
                        {selectedVehicle.trang_thai_xac_thuc}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={actionLoading}
                        onClick={() => updateStatus(selectedVehicle, 'Đã duyệt')}
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
                      >
                        <CircleCheckBig className="w-5 h-5" />
                        Xác thực thành công
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Thông tin người dùng
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Họ tên</span>
                        <span className="font-medium text-gray-900">{selectedUser?.tennguoidung || selectedVehicle.tenchuphuongtien}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900">{selectedUser?.email || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Vai trò</span>
                        <span className="font-medium text-gray-900">{selectedUser?.chucnang || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">PIN</span>
                        <span className="font-medium text-gray-900">{selectedUser?.mapinnguoidung || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Số điện thoại</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.sodienthoai}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">CCCD</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.socccd}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Thông tin phương tiện
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Biển số</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.bienso}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Loại xe</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.maloai}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Hãng xe</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.hangxe}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Màu / dòng xe</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.mauxe}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">GPLX</span>
                        <span className="font-medium text-gray-900">{selectedVehicle.sogplx || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Ngày tạo</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedVehicle.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Tài liệu xác thực
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {docs.map((doc) => {
                      const preview = previews[doc.key];
                      return (
                        <div key={doc.key} className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                          <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-gray-900">{doc.label}</div>
                            {doc.path ? (
                              <a
                                href={preview || doc.path}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900"
                              >
                                Mở
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">Trống</span>
                            )}
                          </div>

                          <div className="p-3">
                            {preview ? (
                              <img
                                src={preview}
                                alt={doc.label}
                                className="w-full h-44 object-cover rounded-lg bg-white border border-gray-200"
                              />
                            ) : (
                              <div className="w-full h-44 rounded-lg bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm text-center px-4">
                                {doc.path ? 'Không tạo được preview. Nhấn Mở để xem tài liệu.' : 'Chưa có file'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Ban className="w-5 h-5" />
                        Từ chối xác thực
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Nhập lý do để gửi về tài khoản chủ xe. Hệ thống sẽ lưu vào bảng <code>xac_thuc_that_bai</code>.
                      </p>

                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        placeholder="Ví dụ: Ảnh CCCD bị mờ, thiếu mặt sau giấy đăng ký xe..."
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="lg:w-[240px] flex flex-col gap-3">
                      <button
                        disabled={actionLoading}
                        onClick={() => updateStatus(selectedVehicle, 'Xác thực thất bại', rejectReason)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Xác thực thất bại
                      </button>

                      {selectedFailure && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                          <div className="font-semibold mb-1">Lý do đã lưu</div>
                          <div>{selectedFailure.noidung}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
          </div> 
      </div> 
    </div> 
  );
};