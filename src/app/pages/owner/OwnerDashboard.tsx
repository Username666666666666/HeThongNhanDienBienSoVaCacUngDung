// OwnerDashboard.tsx

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase.ts';
import {
  Car,
  Bike,
  MessageSquare,
  User,
  Bell,
  Coins,
  Wallet,
  MapPin,
  PlusCircle,
  ClipboardList,
  Settings2,
  History,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';

interface OwnerDetails {
  xuao: number;
  anhdaidien: string | null;
  nguoidung: {
    tennguoidung: string | null;
  } | null;
}

interface VehicleRow {
  id: string;
  maphuongtien: string;
  maloai: string | null;
  bienso: string | null;
  hangxe: string | null;
  mauxe: string | null;
  created_at: string;
}

type TargetRole = 'supervisor' | 'support';

interface RoleInvitePayload {
  action: 'invite_staff';
  targetRole: TargetRole;
  parkingLotId: string;
  parkingLotName: string;
  parkingLotJoinCode: string;
  customName: string;
  canSwitchLots: boolean;
}

interface SystemNotification {
  mathongbao: string;
  manguoigui: string;
  manguoinhan: string;
  loai: string;
  tieude: string;
  noidung: string;
  dadoc: boolean;
  ngaytao: string;
}

interface ParsedNotification extends SystemNotification {
  payload: RoleInvitePayload | null;
}

export const OwnerDashboard = () => {
  const navigate = useNavigate();

  const [virtualCoins, setVirtualCoins] = useState<number>(0);
  const [ownerDetails, setOwnerDetails] = useState<OwnerDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<ParsedNotification[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ParsedNotification | null>(null);
  const [showNoti, setShowNoti] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);

  const fetchOwnerData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: nd } = await supabase
        .from('nguoidung')
        .select('manguoidung')
        .eq('manguoidung', user.id)
        .maybeSingle();

      if (!nd) {
        await supabase.from('nguoidung').insert({
          manguoidung: user.id,
          tennguoidung: user.email,
          email: user.email,
        });
      }

      const { data: cx } = await supabase
        .from('ctchuxe')
        .select('manguoidung')
        .eq('manguoidung', user.id)
        .maybeSingle();

      if (!cx) {
        await supabase.from('ctchuxe').insert({
          manguoidung: user.id,
          xuao: 0,
          anhdaidien: null,
        });
      }

      const { data, error } = await supabase
        .from('ctchuxe')
        .select('xuao, anhdaidien, nguoidung ( tennguoidung )')
        .eq('manguoidung', user.id)
        .single();

      if (error) throw error;

      setOwnerDetails(data as unknown as OwnerDetails);
      setVirtualCoins(data?.xuao || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('phuongtien')
      .select('id, maphuongtien, maloai, bienso, hangxe, mauxe, created_at')
      .eq('manguoidung', user.id)
      .eq('trang_thai_xac_thuc', 'Đã duyệt')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Lỗi tải phương tiện:', error);
      return;
    }

    setVehicles((data || []) as VehicleRow[]);
  };

  useEffect(() => {
    const message = sessionStorage.getItem('toast_message');
    if (message) {
      toast.success(message);
      sessionStorage.removeItem('toast_message');
    }
  }, []);

  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('thongbao')
      .select('*')
      .eq('manguoinhan', user.id)
      .eq('loai', 'role_request')
      .order('ngaytao', { ascending: false });

    if (error) {
      console.error('Lỗi tải thông báo:', error);
      return;
    }

    const parsed: ParsedNotification[] = (data || []).map((n: SystemNotification) => {
      let payload: RoleInvitePayload | null = null;
      try {
        const body = JSON.parse(n.noidung);
        if (body?.action === 'invite_staff') payload = body;
      } catch {
        payload = null;
      }
      return { ...n, payload };
    });

    setNotifications(parsed);
  };

  const handleOpenRequest = async (n: ParsedNotification) => {
    setSelectedRequest(n);
    setShowNoti(false);

    if (!n.dadoc) {
      await supabase.from('thongbao').update({ dadoc: true }).eq('mathongbao', n.mathongbao);

      setNotifications((prev) =>
        prev.map((item) => (item.mathongbao === n.mathongbao ? { ...item, dadoc: true } : item))
      );
    }
  };

  const sendResponseToAdmin = async (
    adminId: string,
    status: 'accepted' | 'rejected',
    payload: RoleInvitePayload
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('thongbao').insert({
      manguoigui: user.id,
      manguoinhan: adminId,
      loai: 'role_request_response',
      tieude:
        status === 'accepted'
          ? `Người dùng đã xác nhận: ${payload.customName}`
          : `Người dùng đã từ chối: ${payload.customName}`,
      noidung: JSON.stringify({
        action: 'staff_invite_response',
        status,
        targetRole: payload.targetRole,
        parkingLotId: payload.parkingLotId,
        parkingLotName: payload.parkingLotName,
        parkingLotJoinCode: payload.parkingLotJoinCode,
        customName: payload.customName,
        canSwitchLots: payload.canSwitchLots,
      }),
      dadoc: false,
    });
  };

  const normalizeCodeNumber = (code: string | null | undefined) => {
    if (!code) return 0;
    const match = code.match(/^NV(\d+)$/i);
    if (!match) return 0;
    return Number(match[1]) || 0;
  };

  const generateNextStaffCode = async (adminId: string) => {
    const { data, error } = await supabase.from('ctnhanvien').select('manhanvien').eq('maadmin', adminId);

    if (error) throw error;

    const maxNum = (data ?? []).reduce((max, row: any) => {
      return Math.max(max, normalizeCodeNumber(row.manhanvien));
    }, 0);

    return `NV${String(maxNum + 1).padStart(4, '0')}`;
  };

  const upsertStaffRecord = async (
    userId: string,
    adminId: string,
    payload: RoleInvitePayload
  ) => {
    const { data: existingStaff, error: existingError } = await supabase
      .from('ctnhanvien')
      .select('manguoidung, maadmin, manhanvien, nghiviec')
      .eq('manguoidung', userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingStaff && existingStaff.maadmin && existingStaff.maadmin !== adminId) {
      throw new Error('Người dùng đang thuộc hệ thống khác');
    }

    const nextCode = existingStaff?.manhanvien || (await generateNextStaffCode(adminId));

    const staffData = {
      manguoidung: userId,
      mabaido: payload.parkingLotId,
      maadmin: adminId,
      duocchuyenbai: payload.canSwitchLots,
      ngayvaolam: new Date().toISOString(),
      hoten: payload.customName,
      manhanvien: nextCode,
      nghiviec: false,
      sodt: null,
      anhdaidien: null,
    };

    if (existingStaff) {
      const { error } = await supabase.from('ctnhanvien').update(staffData).eq('manguoidung', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('ctnhanvien').insert(staffData);
      if (error) throw error;
    }

    return nextCode;
  };

  const handleAccept = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !selectedRequest?.payload) return;

    try {
      const payload = selectedRequest.payload;
      const staffCode = await upsertStaffRecord(user.id, selectedRequest.manguoigui, payload);

      const { error: updateUserError } = await supabase
        .from('nguoidung')
        .update({
          chucnang: payload.targetRole,
        })
        .eq('manguoidung', user.id);

      if (updateUserError) throw updateUserError;

      await sendResponseToAdmin(selectedRequest.manguoigui, 'accepted', payload);

      setSelectedRequest(null);
      await fetchNotifications();
      await fetchOwnerData();

      toast.success(`Đã xác nhận trở thành nhân viên với mã ${staffCode}`);
      globalThis.location.reload();
    } catch (error: any) {
      console.error('ACCEPT ERROR:', error);
      toast.error(error?.message || 'Xác nhận thất bại');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest?.payload) return;

    try {
      await sendResponseToAdmin(selectedRequest.manguoigui, 'rejected', selectedRequest.payload);
      setSelectedRequest(null);
      await fetchNotifications();
      toast.success('Đã từ chối lời mời');
    } catch (error: any) {
      console.error('REJECT ERROR:', error);
      toast.error(error?.message || 'Từ chối thất bại');
    }
  };

  useEffect(() => {
    fetchOwnerData();
    fetchNotifications();
    fetchVehicles();
  }, []);

  const getVehicleMeta = (type: string | null) => {
    const normalized = (type || '').toLowerCase();

    if (normalized === 'car') {
      return {
        icon: Car,
        label: 'Xe ô tô',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
      };
    }

    return {
      icon: Bike,
      label: 'Xe máy',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
    };
  };

  const quickActionCards = useMemo(
    () => [
      {
        title: 'Đăng ký xe mới',
        desc: 'Thêm phương tiện vào hệ thống',
        icon: PlusCircle,
        onClick: () => navigate('/owner/register-vehicle'),
        className: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        iconWrap: 'bg-white/20',
      },
      {
        title: 'Đăng ký đỗ xe',
        desc: 'Đặt chỗ và thanh toán trước',
        icon: MapPin,
        onClick: () => navigate('/owner/parking-lots'),
        className: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        iconWrap: 'bg-white/20',
      },
      {
        title: 'Quản lý phương tiện',
        desc: 'Xem trạng thái phương tiện',
        icon: Settings2,
        onClick: () => navigate('/owner/vehicle-status'),
        className: 'bg-gradient-to-br from-violet-500 to-fuchsia-600',
        iconWrap: 'bg-white/20',
      },
      {
        title: 'Nhật ký đỗ xe',
        desc: 'Xem lịch sử vào ra',
        icon: History,
        onClick: () => navigate('/owner/vehicle-logs'),
        className: 'bg-gradient-to-br from-orange-500 to-red-600',
        iconWrap: 'bg-white/20',
      },
      {
        title: 'Cộng đồng',
        desc: 'Tham gia thảo luận và đánh giá',
        icon: MessageSquare,
        onClick: () => navigate('/community'),
        className: 'bg-gradient-to-br from-purple-500 to-pink-600',
        iconWrap: 'bg-white/20',
      },
    ],
    [navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl mb-2 tracking-tight">
                Xin chào, {ownerDetails?.nguoidung?.tennguoidung || 'Người dùng'}
              </h1>
              <p className="text-blue-100 text-sm">Quản lý phương tiện của bạn</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{virtualCoins.toLocaleString()}</span>
                <span className="text-xs">xu</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowNoti(!showNoti)}
                  className="relative p-2 hover:bg-white/10 rounded-full transition"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.some((n) => !n.dadoc) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {showNoti && (
                  <div className="absolute right-0 top-12 w-[380px] z-50">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">Thông báo</h3>
                            <p className="text-xs text-white/80">
                              {notifications.filter((n) => !n.dadoc).length} chưa đọc
                            </p>
                          </div>
                          <Bell className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="max-h-[420px] overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">Không có thông báo</div>
                        ) : (
                          notifications.map((n) => {
                            const unread = !n.dadoc;

                            return (
                              <button
                                key={n.mathongbao}
                                onClick={() => handleOpenRequest(n)}
                                className={`w-full text-left p-4 rounded-xl transition mb-2 border ${
                                  unread
                                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                    : 'bg-white border-gray-100 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-gray-900">{n.tieude}</span>
                                      {unread && (
                                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-600 text-white">
                                          Mới
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-600 leading-5">
                                      {n.payload ? (
                                        <div className="space-y-1">
                                          <div>
                                            <strong>Người dùng:</strong> {n.payload.customName}
                                          </div>
                                          <div>
                                            <strong>Bãi đỗ:</strong> {n.payload.parkingLotName}
                                          </div>
                                          <div>
                                            <strong>Mã tham gia:</strong> {n.payload.parkingLotJoinCode}
                                          </div>
                                          <div>
                                            <strong>Chức vụ:</strong>{' '}
                                            {n.payload.targetRole === 'supervisor'
                                              ? 'Giám sát viên'
                                              : 'Nhân viên hỗ trợ'}
                                          </div>
                                        </div>
                                      ) : (
                                        n.noidung
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-[11px] text-gray-400 whitespace-nowrap">
                                    {new Date(n.ngaytao).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2 py-1 pr-4 rounded-full transition"
              >
                {ownerDetails?.anhdaidien ? (
                  <img
                    src={ownerDetails.anhdaidien}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border border-white/50"
                  />
                ) : (
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <span className="text-sm font-medium">Hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Số xu ảo</div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{virtualCoins}</div>
            <button
              onClick={() => navigate('/owner/topup')}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              Nạp thêm →
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Phương tiện đã duyệt</div>
              <Car className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
            <div className="text-sm text-gray-500 mt-1">hiển thị 5 phương tiện mới nhất</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Thông báo mới</div>
              <Bell className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {notifications.filter((n) => !n.dadoc).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">lời mời chờ xử lý</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {quickActionCards.slice(0, 2).map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={card.onClick}
                className={`group ${card.className} text-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-center min-h-[170px]`}
              >
                <div
                  className={`${card.iconWrap} p-4 rounded-xl mb-4 inline-block group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold mb-2">{card.title}</div>
                <div className="text-white/80 text-sm">{card.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActionCards.slice(2).map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={card.onClick}
                className={`group ${card.className} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-center min-h-[150px]`}
              >
                <div
                  className={`${card.iconWrap} p-3 rounded-xl mb-3 inline-block group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-xl font-bold mb-1">{card.title}</div>
                <div className="text-white/80 text-sm">{card.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Phương tiện của tôi</h2>
              <p className="text-sm text-gray-500 mt-1">
                Chỉ hiển thị các phương tiện đã được duyệt, mới nhất lên đầu
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2">Loại xe</th>
                  <th className="px-4 py-2">Biển số</th>
                  <th className="px-4 py-2">Hãng xe</th>
                  <th className="px-4 py-2">Màu xe</th>
                  <th className="px-4 py-2">Mã phương tiện</th>
                  <th className="px-4 py-2">Ngày tạo</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="bg-gray-50">
                      <td className="px-4 py-4 rounded-l-xl" colSpan={6}>
                        <div className="h-6 rounded bg-gray-200 animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500 bg-gray-50 rounded-xl">
                      Chưa có phương tiện nào được duyệt
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => {
                    const meta = getVehicleMeta(vehicle.maloai);
                    const Icon = meta.icon;

                    return (
                      <tr key={vehicle.id} className="group">
                        <td className="px-4 py-4 bg-gray-50 rounded-l-xl">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${meta.iconBg}`}>
                              <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{meta.label}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 bg-gray-50">
                          <div className="font-semibold text-gray-900">
                            {vehicle.bienso || 'Chưa có biển số'}
                          </div>
                        </td>
                        <td className="px-4 py-4 bg-gray-50">
                          <div className="text-gray-800">{vehicle.hangxe || 'Chưa có hãng'}</div>
                        </td>
                        <td className="px-4 py-4 bg-gray-50">
                          <div className="text-gray-800">{vehicle.mauxe || 'Chưa có màu'}</div>
                        </td>
                        <td className="px-4 py-4 bg-gray-50">
                          <div className="font-mono text-sm text-gray-700">{vehicle.maphuongtien}</div>
                        </td>
                        <td className="px-4 py-4 bg-gray-50 rounded-r-xl">
                          <div className="text-gray-700">
                            {new Date(vehicle.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedRequest?.payload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 className="text-xl font-bold">Xác nhận lời mời</h2>
              <p className="text-sm text-white/80 mt-1">Người dùng sắp được chuyển thành nhân viên</p>
            </div>

            <div className="p-6 space-y-3 text-sm text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500 text-xs">Bãi đỗ</div>
                  <div className="font-semibold text-gray-900">{selectedRequest.payload.parkingLotName}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500 text-xs">Mã tham gia</div>
                  <div className="font-semibold text-gray-900">
                    {selectedRequest.payload.parkingLotJoinCode}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500 text-xs">Tên hiển thị</div>
                  <div className="font-semibold text-gray-900">{selectedRequest.payload.customName}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500 text-xs">Chức vụ</div>
                  <div className="font-semibold text-gray-900">
                    {selectedRequest.payload.targetRole === 'supervisor'
                      ? 'Giám sát viên'
                      : 'Nhân viên hỗ trợ'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800">
                <div className="font-medium">Quyền đổi bãi</div>
                <div>{selectedRequest.payload.canSwitchLots ? 'Được cấp phép' : 'Không được cấp phép'}</div>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0 justify-end">
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Từ chối
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};