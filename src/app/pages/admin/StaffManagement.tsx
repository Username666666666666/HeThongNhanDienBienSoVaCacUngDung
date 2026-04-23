import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Search,
  Shield,
  Users,
  MapPin,
  Trash2,
  Key,
  Pencil,
  UserX,
  RefreshCw,
  History,
  BadgeInfo,
  Clock3,
} from 'lucide-react';
import {
  createAdminPin,
  getAdminPinHash,
  sendPinResetOtp,
  verifyPinOtp,
  updateAdminPin,
  changeAdminPinWithOldPin,
  markPinResetRequestUsed,
  type PinResetRequest,
} from '../../service/pinService.ts';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

type StaffRole = 'owner' | 'supervisor' | 'support' | 'admin' | 'provider';
type SelectableRole = 'supervisor' | 'support';
type EmploymentStatusFilter = 'all' | 'active' | 'inactive';

interface ParkingLot {
  code: string;
  name: string;
  joinCode: string;
}

interface EmploymentLogRow {
  id: string;
  maadmin: string;
  manguoidung: string;
  hoten: string | null;
  email: string | null;
  manhanvien_cu: string | null;
  manhanvien_moi: string | null;
  ngayvaolam_cu: string | null;
  chucnang_cu: StaffRole | null;
  chucnang_moi: StaffRole | null;
  nghiviec_cu: boolean | null;
  nghiviec_moi: boolean | null;
  hanhdong: string;
  ghichu: string | null;
  created_at: string;
}

interface StaffRecord {
  manguoidung: string;
  email: string;
  displayName: string;
   role: StaffRole;        
  displayRole: StaffRole;  
  parkingLot: ParkingLot | null;
  canSwitchLots: boolean;
  maadmin: string;
  manhanvien: string | null;
  ngayvaolam: string | null;
  nghiviec: boolean;
  sodt: string | null;
  anhdaidien: string | null;
}

interface StaffRow {
  manguoidung: string;
  mabaido: string | null;
  maadmin: string | null;
  duocchuyenbai: boolean | null;
  hoten: string | null;
  manhanvien: string | null;
  nghiviec: boolean | null;
  ngayvaolam: string | null;
  sodt: string | null;
  anhdaidien: string | null;

  nguoidung?: {
    email: string | null;
    tennguoidung: string | null;
    chucnang: StaffRole | null;
  }[];

  baido?: {
    mabaido: string | null;
    tenbaido: string | null;
    mathamgia: string | null;
  }[];
}

interface UserRow {
  manguoidung: string;
  email: string | null;
  tennguoidung: string | null;
  chucnang: StaffRole | null;
}

interface InvitePayload {
  action: 'invite_staff';
  targetRole: SelectableRole;
  parkingLotId: string;
  parkingLotName: string;
  parkingLotJoinCode: string;
  customName: string;
  canSwitchLots: boolean;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('vi-VN');
};

const normalizeCodeNumber = (code: string | null | undefined) => {
  if (!code) return 0;
  const match = code.match(/^NV(\d+)$/i);
  if (!match) return 0;
  return Number(match[1]) || 0;
};
const generateNextStaffCode = async (adminId: string) => {
  const { data, error } = await supabase
    .from('ctnhanvien')
    .select('manhanvien')
    .eq('maadmin', adminId);

  if (error) throw error;

  const maxNum = (data ?? []).reduce((max, row: any) => {
    return Math.max(max, normalizeCodeNumber(row.manhanvien));
  }, 0);

  return `NV${String(maxNum + 1).padStart(5, '0')}`;
};

export const StaffManagement = () => {
  const navigate = useNavigate();

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | SelectableRole>('all');
  const [filterStatus, setFilterStatus] = useState<EmploymentStatusFilter>('all');

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<SelectableRole>('support');
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('');
  const [canSwitchLots, setCanSwitchLots] = useState(false);

  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [employmentLogs, setEmploymentLogs] = useState<EmploymentLogRow[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<SelectableRole>('support');
  const [editParkingLot, setEditParkingLot] = useState<string>('');
  const [editCanSwitchLots, setEditCanSwitchLots] = useState(false);

const [showPinManager, setShowPinManager] = useState(false);
const [adminEmail, setAdminEmail] = useState("");
const [hasAdminPin, setHasAdminPin] = useState(false);

const [loadingPin, setLoadingPin] = useState(false);

// tạo PIN lần đầu
const [createPin, setCreatePin] = useState("");
const [createConfirmPin, setCreateConfirmPin] = useState("");

// đổi PIN hiện tại
const [oldPin, setOldPin] = useState("");
const [newPin, setNewPin] = useState("");
const [confirmPin, setConfirmPin] = useState("");

// quên PIN
const [pinStep, setPinStep] = useState<"email" | "otp" | "reset">("email");
const [otp, setOtp] = useState("");
const [resetPin, setResetPin] = useState("");
const [resetConfirmPin, setResetConfirmPin] = useState("");
const [resetRequest, setResetRequest] = useState<PinResetRequest | null>(null);

  const getLatestLogForUser = (userId: string) => {
    return employmentLogs.find((log) => log.manguoidung === userId) ?? null;
  };


const loadAdminPinState = async (adminId: string, email: string) => {
  setAdminEmail(email.toLowerCase());

  const pinRow = await getAdminPinHash(adminId);
  setHasAdminPin(Boolean(pinRow?.mapinadmin));
};

  



  const handleCreatePin = async () => {
  if (createPin.length !== 8) {
    toast.error("PIN phải 8 số");
    return;
  }

  if (createPin !== createConfirmPin) {
    toast.error("PIN xác nhận không khớp");
    return;
  }

  setLoadingPin(true);
  try {
    await createAdminPin(currentAdminId, createPin);
    setHasAdminPin(true);
    setCreatePin("");
    setCreateConfirmPin("");
    toast.success("Đã tạo PIN admin");
  } catch (err: any) {
    toast.error(err?.message || "Không tạo được PIN");
  } finally {
    setLoadingPin(false);
  }
};

  const roleLabels: Record<SelectableRole, string> = {
    supervisor: 'Giám sát viên',
    support: 'Nhân viên hỗ trợ',
  };

const handleChangePin = async () => {
  if (!hasAdminPin) {
    toast.error("Chưa có PIN, hãy tạo lần đầu trước");
    return;
  }

  if (oldPin.length !== 8) {
    toast.error("PIN cũ phải đủ 8 số");
    return;
  }

  if (newPin.length !== 8) {
    toast.error("PIN mới phải đủ 8 số");
    return;
  }

  if (newPin !== confirmPin) {
    toast.error("PIN không khớp");
    return;
  }

  setLoadingPin(true);
  try {
    await changeAdminPinWithOldPin(currentAdminId, oldPin, newPin);
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    toast.success("Đổi PIN thành công");
  } catch (err: any) {
    toast.error(err?.message || "Đổi PIN thất bại");
  } finally {
    setLoadingPin(false);
  }
};

const handleSendOtp = async () => {
  if (!adminEmail) {
    toast.error("Không lấy được email admin");
    return;
  }

  setLoadingPin(true);
  try {
    await sendPinResetOtp(adminEmail);
    setPinStep("otp");
    toast.success("Đã gửi OTP về email admin");
  } catch (err: any) {
    toast.error(err?.message || "Không gửi được OTP");
  } finally {
    setLoadingPin(false);
  }
};

const handleVerifyOtp = async () => {
  if (otp.length !== 8) {
    toast.error("OTP phải đủ 8 số");
    return;
  }

  setLoadingPin(true);
  try {
    const request = await verifyPinOtp(adminEmail, otp);

    if (!request?.manguoidung) {
      toast.error("OTP sai hoặc đã hết hạn");
      return;
    }

    setResetRequest(request);
    setPinStep("reset");
    toast.success("Xác thực OTP thành công");
  } catch (err: any) {
    toast.error(err?.message || "Xác thực thất bại");
  } finally {
    setLoadingPin(false);
  }
};

const handleResetPin = async () => {
  if (!resetRequest?.manguoidung) {
    toast.error("Thiếu dữ liệu reset");
    return;
  }

  if (resetPin.length !== 8) {
    toast.error("PIN mới phải đủ 8 số");
    return;
  }

  if (resetPin !== resetConfirmPin) {
    toast.error("PIN xác nhận không khớp");
    return;
  }

  setLoadingPin(true);
  try {
    await updateAdminPin(resetRequest.manguoidung, resetPin);
    await markPinResetRequestUsed(resetRequest.id);

    toast.success("Đặt lại PIN admin thành công");

    setPinStep("email");
    setOtp("");
    setResetPin("");
    setResetConfirmPin("");
    setResetRequest(null);
  } catch (err: any) {
    toast.error(err?.message || "Không đặt lại PIN được");
  } finally {
    setLoadingPin(false);
  }
};

  const resetForm = () => {
    setNewEmail('');
    setNewName('');
    setNewRole('support');
    setSelectedParkingLot('');
    setCanSwitchLots(false);
  };

  const resetEditForm = () => {
    setEditingStaff(null);
    setEditDisplayName('');
    setEditRole('support');
    setEditParkingLot('');
    setEditCanSwitchLots(false);
  };

  const getRoleLabel = (role: StaffRole) => {
    if (role === 'supervisor') return 'Giám sát viên';
    if (role === 'support') return 'Nhân viên hỗ trợ';
    if (role === 'owner') return 'Người dùng';
    if (role === 'admin') return 'Admin';
    if (role === 'provider') return 'Nhà cung cấp';
    return role;
  };

  const getRoleBadgeClass = (role: StaffRole) => {
    if (role === 'supervisor') return 'bg-green-100 text-green-700';
    if (role === 'support') return 'bg-blue-100 text-blue-700';
    if (role === 'owner') return 'bg-gray-100 text-gray-700';
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'provider') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusBadgeClass = (isInactive: boolean) =>
    isInactive ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';

   const getAccessLabel = (role?: string | null) => {
    if (role === 'owner') return 'người dùng';
    if (role === 'support') return 'nhân viên hỗ trợ';
    if (role === 'supervisor') return 'nhân viên giám sát';
    if (role === 'admin') return 'admin';
    if (role === 'provider') return 'nhà cung cấp';
    return role || 'N/A';
  };
  const fetchParkingLots = async (adminId: string) => {
    const { data, error } = await supabase
      .from('baido')
      .select('mabaido, tenbaido, mathamgia')
      .eq('manguoidung', adminId)
      .order('tenbaido', { ascending: true });

    if (error) {
      console.error('FETCH PARKING LOTS ERROR:', error);
      toast.error('Lỗi load bãi đỗ');
      return;
    }

    const mapped: ParkingLot[] = (data ?? []).map((item: any) => ({
      code: item.mabaido,
      name: item.tenbaido,
      joinCode: item.mathamgia,
    }));

    setParkingLots(mapped);
  };

const fetchEmploymentLogs = async (adminId: string) => {
  const { data, error } = await supabase
    .from('nhatkynghiviec')
    .select(`
      id,
      maadmin,
      manguoidung,
      hoten,
      email,
      manhanvien_cu,
      manhanvien_moi,
      ngayvaolam_cu,
      chucnang_cu,
      chucnang_moi,
      nghiviec_cu,
      nghiviec_moi,
      hanhdong,
      ghichu,
      created_at
    `)
    .eq('maadmin', adminId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('FETCH EMPLOYMENT LOGS ERROR:', error);
    toast.error('Lỗi load nhật ký');
    return [];
  }

  const logs = (data ?? []) as EmploymentLogRow[];
  setEmploymentLogs(logs);
  return logs;
};

  const fetchStaff = async (adminId: string, logs: EmploymentLogRow[] = []) => {
    const { data, error } = await supabase
      .from('ctnhanvien')
      .select(`
        manguoidung,
        mabaido,
        maadmin,
        duocchuyenbai,
        hoten,
        manhanvien,
        nghiviec,
        ngayvaolam,
        sodt,
        anhdaidien,
        nguoidung (
          email,
          tennguoidung,
          chucnang
        )
      `)
      .eq('maadmin', adminId);

    if (error) {
      console.error(error);
      toast.error('Lỗi load nhân viên');
      return;
    }

    const { data: lots } = await supabase
      .from('baido')
      .select('mabaido, tenbaido, mathamgia');

    const lotMap = new Map((lots || []).map((l) => [l.mabaido, l]));

     const mapped: StaffRecord[] = (data || []).map((item: any) => {
      const user = Array.isArray(item.nguoidung) ? item.nguoidung[0] : item.nguoidung;
      const lot = lotMap.get(item.mabaido);

      const latestLog = logs.find((log) => log.manguoidung === item.manguoidung);
      const baseRole: StaffRole = user?.chucnang || 'support';

      const displayRole: StaffRole = item.nghiviec
        ? ((latestLog?.chucnang_cu && latestLog.chucnang_cu !== 'owner'
            ? latestLog.chucnang_cu
            : baseRole) || 'support')
        : baseRole;

      return {
        manguoidung: item.manguoidung,
        email: user?.email || 'unknown',
        displayName:
          item.hoten?.trim() ||
          user?.tennguoidung?.trim() ||
          user?.email ||
          'Không tên',
        role: baseRole,
        displayRole,
        parkingLot: lot
          ? {
              code: lot.mabaido,
              name: lot.tenbaido,
              joinCode: lot.mathamgia,
            }
          : null,
        canSwitchLots: item.duocchuyenbai ?? false,
        maadmin: item.maadmin || '',
        manhanvien: item.manhanvien || null,
        ngayvaolam: item.ngayvaolam || null,
        nghiviec: item.nghiviec ?? false,
        sodt: item.sodt || null,
        anhdaidien: item.anhdaidien ?? null,
      };
    });

    setStaffList(mapped);
  };

  const loadData = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('AUTH ERROR:', authError);
      toast.error('Không thể xác thực phiên đăng nhập');
      return;
    }

    const user = authData.user;
    if (!user) {
      toast.error('Bạn chưa đăng nhập');
      navigate('/login');
      return;
    }

    setCurrentAdminId(user.id);
await loadAdminPinState(user.id, user.email ?? "");

    const logs = await fetchEmploymentLogs(user.id);
    await Promise.all([
      fetchParkingLots(user.id),
      fetchStaff(user.id, logs),
    ]);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      if (filterRole !== 'all' && staff.role !== filterRole) return false;

      if (filterStatus === 'active' && staff.nghiviec) return false;
      if (filterStatus === 'inactive' && !staff.nghiviec) return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        staff.displayName.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        (staff.manhanvien || '').toLowerCase().includes(q) ||
        (staff.parkingLot?.name || '').toLowerCase().includes(q) ||
        (staff.parkingLot?.joinCode || '').toLowerCase().includes(q)
      );
    });
  }, [staffList, filterRole, filterStatus, searchQuery]);

  const checkTargetUser = async (): Promise<UserRow | null> => {
    const email = newEmail.trim().toLowerCase();

    if (!email) {
      toast.error('Vui lòng nhập email tài khoản');
      return null;
    }

    const { data, error } = await supabase
      .from('nguoidung')
      .select('manguoidung, email, tennguoidung, chucnang')
      .ilike('email', email)
      .maybeSingle();

    if (error) {
      console.error('LOOKUP USER ERROR:', error);
      toast.error('Không tìm thấy người dùng');
      return null;
    }

    if (!data) {
      toast.error('Email không tồn tại trong hệ thống');
      return null;
    }

    return data as UserRow;
  };

  const generateNextStaffCode = async (adminId: string) => {
    const { data, error } = await supabase
      .from('ctnhanvien')
      .select('manhanvien')
      .eq('maadmin', adminId);

    if (error) {
      console.error('GENERATE CODE ERROR:', error);
      throw error;
    }

    const maxNum = (data ?? []).reduce((max, row: any) => {
      return Math.max(max, normalizeCodeNumber(row.manhanvien));
    }, 0);

    return `NV${String(maxNum + 1).padStart(4, '0')}`;
  };

  const insertHistory = async (payload: Partial<EmploymentLogRow>) => {
    const { error } = await supabase.from('nhatkynghiviec').insert(payload);
    if (error) {
      console.error('INSERT HISTORY ERROR:', error);
      throw error;
    }
  };

  const handleSendInvite = async () => {
    if (!currentAdminId) {
      toast.error('Bạn chưa đăng nhập');
      return;
    }

    if (!newEmail.trim()) {
      toast.error('Vui lòng nhập email tài khoản');
      return;
    }

    if (!newName.trim()) {
      toast.error('Vui lòng nhập tên hiển thị');
      return;
    }

    if (!selectedParkingLot) {
      toast.error('Vui lòng chọn 1 bãi đỗ');
      return;
    }

    const lot = parkingLots.find((item) => item.code === selectedParkingLot);
    if (!lot) {
      toast.error('Bãi đỗ không hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      const targetUser = await checkTargetUser();
      if (!targetUser) return;

      if (targetUser.chucnang === 'admin') {
        toast.error('Không thể thêm tài khoản admin');
        return;
      }

      if (targetUser.chucnang === 'provider') {
        toast.error('Không thể thêm nhà cung cấp');
        return;
      }

      if (targetUser.chucnang !== 'owner') {
        toast.error('Chỉ có thể mời tài khoản người dùng');
        return;
      }

      const { data: existingStaff, error: existingError } = await supabase
        .from('ctnhanvien')
        .select('manguoidung, maadmin, nghiviec')
        .eq('manguoidung', targetUser.manguoidung)
        .maybeSingle();

      if (existingError) {
        console.error('CHECK EXISTING STAFF ERROR:', existingError);
        toast.error('Không thể kiểm tra nhân viên hiện tại');
        return;
      }

      if (existingStaff) {
        if (existingStaff.maadmin === currentAdminId) {
          if (existingStaff.nghiviec) {
            toast.error('Tài khoản này đang thôi việc. Hãy dùng nút hoạt động lại.');
          } else {
            toast.error('Nhân viên đã có trong hệ thống của bạn');
          }
        } else {
          toast.error('Người này đang thuộc hệ thống khác');
        }
        return;
      }

      const payload: InvitePayload = {
        action: 'invite_staff',
        targetRole: newRole,
        parkingLotId: lot.code,
        parkingLotName: lot.name,
        parkingLotJoinCode: lot.joinCode,
        customName: newName.trim(),
        canSwitchLots,
      };

      const { error: notifyError } = await supabase.from('thongbao').insert({
        manguoigui: currentAdminId,
        manguoinhan: targetUser.manguoidung,
        loai: 'role_request',
        tieude: 'Lời mời trở thành nhân viên',
        noidung: JSON.stringify(payload),
        dadoc: false,
      });

      if (notifyError) {
        console.error('INSERT THONGBAO ERROR:', notifyError);
        toast.error('Lỗi gửi lời mời');
        return;
      }

      toast.success('Đã gửi lời mời đến Người dùng');
      resetForm();
      setShowAddStaff(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSwitchPermission = async (staff: StaffRecord) => {
    const { error } = await supabase
      .from('ctnhanvien')
      .update({ duocchuyenbai: !staff.canSwitchLots })
      .eq('manguoidung', staff.manguoidung)
      .eq('maadmin', currentAdminId);

    if (error) {
      console.error('TOGGLE SWITCH PERMISSION ERROR:', error);
      toast.error('Lỗi cập nhật quyền');
      return;
    }

    await insertHistory({
      maadmin: currentAdminId,
      manguoidung: staff.manguoidung,
      hoten: staff.displayName,
      email: staff.email,
      manhanvien_cu: staff.manhanvien,
      manhanvien_moi: staff.manhanvien,
      ngayvaolam_cu: staff.ngayvaolam,
      chucnang_cu: staff.displayRole,
      chucnang_moi: staff.displayRole,
      nghiviec_cu: staff.nghiviec,
      nghiviec_moi: staff.nghiviec,
      hanhdong: 'toggle_switch_permission',
      ghichu: staff.canSwitchLots ? 'Thu hồi quyền đổi bãi' : 'Cấp quyền đổi bãi',
    });

    toast.success(staff.canSwitchLots ? 'Đã thu hồi quyền đổi bãi' : 'Đã cấp quyền đổi bãi');
    await Promise.all([fetchStaff(currentAdminId), fetchEmploymentLogs(currentAdminId)]);
  };

  const handleToggleEmploymentStatus = async (staff: StaffRecord) => {
    if (!currentAdminId) return;

    setIsLoading(true);
    try {
      if (!staff.nghiviec) {
        const { error: staffError } = await supabase
          .from('ctnhanvien')
          .update({ nghiviec: true })
          .eq('manguoidung', staff.manguoidung)
          .eq('maadmin', currentAdminId);

        if (staffError) {
          console.error('DEACTIVATE STAFF ERROR:', staffError);
          toast.error('Không thể chuyển sang trạng thái thôi việc');
          return;
        }

        const { error: roleError } = await supabase
          .from('nguoidung')
          .update({ chucnang: 'owner' })
          .eq('manguoidung', staff.manguoidung);

        if (roleError) {
          console.error('REVERT ROLE ERROR:', roleError);
          toast.error('Đã thôi việc nhưng lỗi trả role về owner');
          return;
        }

        await insertHistory({
          maadmin: currentAdminId,
          manguoidung: staff.manguoidung,
          hoten: staff.displayName,
          email: staff.email,
          manhanvien_cu: staff.manhanvien,
          manhanvien_moi: staff.manhanvien,
          ngayvaolam_cu: staff.ngayvaolam,
          chucnang_cu: staff.displayRole,
          chucnang_moi: 'owner',
          nghiviec_cu: false,
          nghiviec_moi: true,
          hanhdong: 'deactivate',
          ghichu: 'Cho thôi việc',
        });

        toast.success('Đã chuyển tài khoản sang thôi việc');
      } else {
        const { data: currentUser, error: currentUserError } = await supabase
          .from('nguoidung')
          .select('chucnang')
          .eq('manguoidung', staff.manguoidung)
          .maybeSingle();

        if (currentUserError) {
          console.error('CHECK CURRENT USER ROLE ERROR:', currentUserError);
          toast.error('Không thể kiểm tra quyền truy cập hiện tại');
          return;
        }

        if (!currentUser || currentUser.chucnang !== 'owner') {
          toast.error('Chỉ tài khoản có quyền truy cập là người dùng mới được hoạt động lại');
          return;
        }

        const newCode = await generateNextStaffCode(currentAdminId);
        
        const latestLog = getLatestLogForUser(staff.manguoidung);
        const restoreRole =
          (latestLog?.chucnang_cu && latestLog.chucnang_cu !== 'owner'
            ? latestLog.chucnang_cu
            : 'support') || 'support';

        const { error: staffError } = await supabase
          .from('ctnhanvien')
          .update({
            nghiviec: false,
            manhanvien: newCode,
            ngayvaolam: new Date().toISOString(),
          })
          .eq('manguoidung', staff.manguoidung)
          .eq('maadmin', currentAdminId);

        if (staffError) {
          console.error('REACTIVATE STAFF ERROR:', staffError);
          toast.error('Không thể hoạt động lại tài khoản');
          return;
        }

        const { error: roleError } = await supabase
          .from('nguoidung')
          .update({ chucnang: restoreRole })
          .eq('manguoidung', staff.manguoidung);

        if (roleError) {
          console.error('RESTORE ROLE ERROR:', roleError);
          toast.error('Đã hoạt động lại nhưng lỗi khôi phục quyền truy cập');
          return;
        }

        await insertHistory({
          maadmin: currentAdminId,
          manguoidung: staff.manguoidung,
          hoten: staff.displayName,
          email: staff.email,
          manhanvien_cu: staff.manhanvien,
          manhanvien_moi: newCode,
          ngayvaolam_cu: staff.ngayvaolam,
          chucnang_cu: 'owner',
          chucnang_moi: restoreRole,
          nghiviec_cu: true,
          nghiviec_moi: false,
          hanhdong: 'reactivate',
          ghichu: 'Kích hoạt lại tài khoản',
        });

        toast.success(`Đã hoạt động lại và tạo mã mới ${newCode}`);
      }

      await Promise.all([fetchStaff(currentAdminId), fetchEmploymentLogs(currentAdminId)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditStaff = (staff: StaffRecord) => {
    setEditingStaff(staff);
    setEditDisplayName(staff.displayName || '');
    setEditRole(staff.displayRole === 'supervisor' ? 'supervisor' : 'support');
    setEditParkingLot(staff.parkingLot?.code || '');
    setEditCanSwitchLots(staff.canSwitchLots);
    setShowEditStaff(true);
  };

  const handleSaveEditStaff = async () => {
    if (!editingStaff) return;

    const trimmedName = editDisplayName.trim();
    if (!trimmedName) {
      toast.error('Tên hiển thị không được để trống');
      return;
    }

    if (!editParkingLot) {
      toast.error('Vui lòng chọn bãi đỗ');
      return;
    }

    setIsLoading(true);
    try {
      const { error: userError } = await supabase
        .from('nguoidung')
        .update({
          chucnang: editRole,
        })
        .eq('manguoidung', editingStaff.manguoidung);

      if (userError) {
        console.error('UPDATE USER ERROR:', userError);
        toast.error('Không thể cập nhật chức vụ người dùng');
        return;
      }

      const { error: staffError } = await supabase
        .from('ctnhanvien')
        .update({
          hoten: trimmedName,
          mabaido: editParkingLot,
          duocchuyenbai: editCanSwitchLots,
        })
        .eq('manguoidung', editingStaff.manguoidung)
        .eq('maadmin', currentAdminId);

      if (staffError) {
        console.error('UPDATE STAFF ERROR:', staffError);
        toast.error('Không thể cập nhật thông tin nhân viên');
        return;
      }

      await insertHistory({
        maadmin: currentAdminId,
        manguoidung: editingStaff.manguoidung,
        hoten: trimmedName,
        email: editingStaff.email,
        manhanvien_cu: editingStaff.manhanvien,
        manhanvien_moi: editingStaff.manhanvien,
        ngayvaolam_cu: editingStaff.ngayvaolam,
        chucnang_cu: editingStaff.displayRole,
        chucnang_moi: editRole,
        nghiviec_cu: editingStaff.nghiviec,
        nghiviec_moi: editingStaff.nghiviec,
        hanhdong: 'update',
        ghichu: 'Cập nhật thông tin nhân viên',
      });

      toast.success('Đã cập nhật nhân viên');
      setShowEditStaff(false);
      resetEditForm();
      await Promise.all([fetchStaff(currentAdminId), fetchEmploymentLogs(currentAdminId)]);
    } finally {
      setIsLoading(false);
    }
  };

  const latestActiveCount = staffList.filter((s) => !s.nghiviec).length;
  const inactiveCount = staffList.filter((s) => s.nghiviec).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1 flex items-center gap-2">
                <Users className="w-7 h-7" />
                Quản lý nhân viên
              </h1>
              <p className="text-purple-100 text-sm">
                Phân quyền theo bãi đỗ, hỗ trợ mã nhân viên, nghỉ việc và hoạt động lại
              </p>
            </div>
            <button
              onClick={() => setShowAddStaff(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Mời Người dùng
            </button>
            <button
  onClick={() => setShowPinManager(true)}
  className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
>
  <Key className="w-5 h-5" />
  Quản lý PIN admin
</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Tổng nhân viên</div>
              <div className="text-2xl">{staffList.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Đang hoạt động</div>
              <div className="text-2xl">{latestActiveCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Đã thôi việc</div>
              <div className="text-2xl">{inactiveCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm mb-1">Giám sát viên</div>
              <div className="text-2xl">{staffList.filter((s) => s.displayRole === 'supervisor').length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-3 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, email, mã NV, tên bãi hoặc mã tham gia..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | SelectableRole)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả chức vụ</option>
              <option value="supervisor">Giám sát viên</option>
              <option value="support">Nhân viên hỗ trợ</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EmploymentStatusFilter)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã thôi việc</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy nhân viên</p>
            </div>
          ) : (
            filteredStaff.map((staff) => {
              const latestLog = getLatestLogForUser(staff.manguoidung);

              return (
                <div key={staff.manguoidung} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
  {staff.anhdaidien ? (
    <img
      src={staff.anhdaidien}
      alt={staff.displayName}
      className="w-full h-full object-cover"
    />
  ) : (
    <div
      className={`w-full h-full flex items-center justify-center text-white text-xl ${
        staff.displayRole === 'supervisor' ? 'bg-green-500' : 'bg-blue-500'
      }`}
    >
      {staff.displayName?.[0] || 'U'}
    </div>
  )}
</div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl text-gray-900">{staff.displayName}</h3>

                          <span className={`px-3 py-1 rounded-full text-sm ${getRoleBadgeClass(staff.displayRole)}`}>
  {getRoleLabel(staff.displayRole)}
</span>

                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(staff.nghiviec)}`}>
                            {staff.nghiviec ? 'Đã thôi việc' : 'Đang hoạt động'}
                          </span>

                          {staff.manhanvien && (
                            <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                              Mã NV: {staff.manhanvien}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
                          <Key className="w-4 h-4" />
                          <span className="font-mono">{staff.email}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="rounded-lg border border-gray-200 p-3">
                            <div className="text-xs text-gray-500 mb-1">Mã nhân viên hiện tại</div>
                            <div className="font-semibold text-gray-900">{staff.manhanvien || 'Chưa có'}</div>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-3">
                            <div className="text-xs text-gray-500 mb-1">Ngày vào làm hiện tại</div>
                            <div className="font-semibold text-gray-900">{formatDateTime(staff.ngayvaolam)}</div>
                          </div>
                        </div>

                        {latestLog && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="rounded-lg border border-dashed border-gray-300 p-3 bg-gray-50">
                              <div className="text-xs text-gray-500 mb-1">Mã nhân viên cũ</div>
                              <div className="font-semibold text-gray-900">
                                {latestLog.manhanvien_cu || 'N/A'}
                              </div>
                            </div>
                            <div className="rounded-lg border border-dashed border-gray-300 p-3 bg-gray-50">
                              <div className="text-xs text-gray-500 mb-1">Ngày vào làm cũ</div>
                              <div className="font-semibold text-gray-900">
                                {formatDateTime(latestLog.ngayvaolam_cu)}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700">Bãi đỗ được phân quyền:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {staff.parkingLot ? (
                                  <>
                                    <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                      {staff.parkingLot.name}
                                    </span>
                                    <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                                      Mã tham gia: {staff.parkingLot.joinCode || 'N/A'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                    Chưa gán bãi đỗ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Key className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm text-gray-700">Quyền đổi bãi:</span>
                            {staff.canSwitchLots ? (
                              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                ✅ Đã cấp phép
                              </span>
                            ) : (
                              <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                                ❌ Chưa cấp phép
                              </span>
                            )}
                            <button
                              onClick={() => handleToggleSwitchPermission(staff)}
                              className={`text-xs px-3 py-1 rounded-lg transition-all ${
                                staff.canSwitchLots
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {staff.canSwitchLots ? 'Thu hồi' : 'Cấp phép'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditStaff(staff)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleToggleEmploymentStatus(staff)}
                        className={`p-2 rounded-lg transition-all ${
                          staff.nghiviec
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={staff.nghiviec ? 'Hoạt động lại' : 'Cho thôi việc'}
                      >
                        {staff.nghiviec ? <RefreshCw className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Nhật ký hoạt động</h2>
          </div>

          {employmentLogs.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có nhật ký nào.</div>
          ) : (
            <div className="space-y-3">
              {employmentLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold text-gray-900">{log.hoten || 'Không tên'}</div>
                      <div className="text-sm text-gray-600 font-mono">{log.email || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Thời điểm: {formatDateTime(log.created_at)}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                      {log.hanhdong}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500">Mã NV cũ</div>
                      <div className="font-medium">{log.manhanvien_cu || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500">Mã NV mới</div>
                      <div className="font-medium">{log.manhanvien_moi || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500">Ngày vào làm cũ</div>
                      <div className="font-medium">{formatDateTime(log.ngayvaolam_cu)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-500">Trạng thái</div>
                      <div className="font-medium">
                        {log.nghiviec_moi ? 'Đã thôi việc' : 'Đang hoạt động'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    <div>
                      <strong>Quyền truy cập cũ:</strong> {getAccessLabel(log.chucnang_cu)}
                    </div>
                    <div>
                      <strong>Quyền truy cập mới:</strong> {getAccessLabel(log.chucnang_moi)}
                    </div>
                    {log.ghichu && (
                      <div className="mt-1">
                        <strong>Ghi chú:</strong> {log.ghichu}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl text-gray-900 flex items-center gap-2">
    <UserPlus className="w-7 h-7 text-purple-600" />
    Mời Người dùng trở thành nhân viên
  </h2>

  <div className="flex items-center gap-2">
    <button
      onClick={() => setShowPinManager(true)}
      className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
    >
      Quản lý PIN
    </button>

    <button
      onClick={() => {
        setShowAddStaff(false);
        resetForm();
      }}
      className="p-2 hover:bg-gray-100 rounded-lg"
    >
      ✕
    </button>
  </div>
</div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email tài khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="VD: user@domain.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="VD: Nhân Viên Hỗ Trợ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Chức vụ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setNewRole('support')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newRole === 'support'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-medium">Nhân viên hỗ trợ</div>
                        <div className="text-xs text-gray-600">Xử lý hỗ trợ, quản lý cộng đồng</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setNewRole('supervisor')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      newRole === 'supervisor'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-medium">Giám sát viên</div>
                        <div className="text-xs text-gray-600">Quản lý bãi đỗ được phân quyền</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Chọn bãi đỗ <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                  {parkingLots.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-6">
                      Chưa có bãi đỗ nào thuộc tài khoản admin này
                    </div>
                  ) : (
                    parkingLots.map((lot) => (
                      <div key={lot.code} className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="parkingLot"
                            checked={selectedParkingLot === lot.code}
                            onChange={() => setSelectedParkingLot(lot.code)}
                            className="mt-1 w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium mb-1">{lot.name}</div>
                            <div className="text-sm text-gray-600">Mã tham gia: {lot.joinCode || 'N/A'}</div>
                            <div className="text-sm text-gray-600">Mã bãi đỗ: {lot.code}</div>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="font-bold text-gray-900">Cấp quyền đổi bãi</div>
                      <div className="text-sm text-gray-600">
                        Cho phép nhân viên chuyển bãi khi cần
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCanSwitchLots(!canSwitchLots)}
                    className={`relative w-16 h-8 rounded-full transition ${
                      canSwitchLots ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                        canSwitchLots ? 'translate-x-8' : ''
                      }`}
                    />
                  </button>
                </div>
                {canSwitchLots && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                    ⚠️ Quyền này sẽ cấp chức năng <strong>chuyển bãi đỗ</strong> trong hệ thống, nhân viên cần nhập{' '}
                    <strong>mã pin admin</strong>{' '}để được chuyển bãi.
                  </div>
                )}
              </div>

              <div
                className={`rounded-lg p-4 ${
                  newRole === 'supervisor'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div
                  className={`text-sm ${
                    newRole === 'supervisor' ? 'text-green-800' : 'text-blue-800'
                  }`}
                >
                  {newRole === 'supervisor' ? (
                    <>
                      <strong>Nhân viên giám sát</strong> sẽ được gửi thông báo chờ xác nhận. Khi tài khoản người dùng xác nhận, hệ thống sẽ:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Đổi <strong>quyền truy cập</strong> từ <strong>người dùng</strong> sang <strong>nhân viên giám sát</strong></li>
                        <li>Tạo mã nhân viên mới</li>
                        <li>Gán vào bãi đỗ đã chọn</li>
                        <li>Lưu quyền đổi bãi nếu đã bật</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <strong>Nhân viên hỗ trợ</strong> sẽ được gửi thông báo chờ xác nhận. Khi tài khoản người dùng xác nhận, hệ thống sẽ:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Đổi <strong>quyền truy cập</strong> từ <strong>người dùng</strong> sang <strong>nhân viên hỗ trợ</strong></li>
                        <li>Tạo mã nhân viên mới</li>
                        <li>Gán vào bãi đỗ đã chọn</li>
                        <li>Lưu quyền đổi bãi nếu đã bật</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStaff(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSendInvite}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lời mời'}
              </button>
            </div>
          </div>
        </div>
      )}
{showPinManager && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-600" />
            Quản lý PIN admin
          </h2>
          <p className="text-sm text-gray-500">
            PIN tạo lần đầu nằm ở <span className="font-semibold">ctadmin.mapinadmin</span>
          </p>
        </div>

        <button
          onClick={() => setShowPinManager(false)}
          className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {hasAdminPin ? "Đổi PIN hiện tại" : "Tạo PIN lần đầu"}
          </h3>

          {!hasAdminPin ? (
            <div className="space-y-4">
              <input
                type="password"
                value={createPin}
                onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="PIN mới 8 số"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              />
              <input
                type="password"
                value={createConfirmPin}
                onChange={(e) => setCreateConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="Nhập lại PIN"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              />
              <button
                onClick={handleCreatePin}
                disabled={loadingPin}
                className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loadingPin ? "Đang tạo..." : "Tạo PIN"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="PIN cũ"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
                />
              </div>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="PIN mới 8 số"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              />
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="Nhập lại PIN"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              />
              <button
                onClick={handleChangePin}
                disabled={loadingPin}
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loadingPin ? "Đang đổi..." : "Đổi PIN"}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quên PIN</h3>

          {pinStep === "email" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-white p-4 text-sm text-gray-700">
                Email nhận OTP: <strong>{adminEmail || "Không lấy được email"}</strong>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loadingPin || !adminEmail}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loadingPin ? "Đang gửi..." : "Gửi OTP"}
              </button>
            </div>
          )}

          {pinStep === "otp" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-white p-4 text-sm text-gray-700">
                OTP đã gửi đến: <strong>{adminEmail}</strong>
              </div>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="Nhập OTP 8 số"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center tracking-[0.3em] outline-none"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loadingPin}
                className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loadingPin ? "Đang kiểm tra..." : "Xác thực OTP"}
              </button>
            </div>
          )}

          {pinStep === "reset" && (
            <div className="space-y-4">
              <input
                type="password"
                value={resetPin}
                onChange={(e) => setResetPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="PIN mới 8 số"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              />
              <input
                type="password"
                value={resetConfirmPin}
                onChange={(e) =>
                  setResetConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                placeholder="Nhập lại PIN"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              />
              <button
                onClick={handleResetPin}
                disabled={loadingPin}
                className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loadingPin ? "Đang lưu..." : "Đặt lại PIN"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

      {showEditStaff && editingStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900 flex items-center gap-2">
                <Pencil className="w-7 h-7 text-blue-600" />
                Chỉnh sửa nhân viên
              </h2>
              <button
                onClick={() => {
                  setShowEditStaff(false);
                  resetEditForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Tên hiển thị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Nhập tên hiển thị mới"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Email</label>
                  <input
                    type="text"
                    value={editingStaff.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Mã nhân viên hiện tại</div>
                  <div className="font-semibold text-gray-900">{editingStaff.manhanvien || 'Chưa có'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Ngày vào làm hiện tại</div>
                  <div className="font-semibold text-gray-900">{formatDateTime(editingStaff.ngayvaolam)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Chức vụ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditRole('support')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      editRole === 'support'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-medium">Nhân viên hỗ trợ</div>
                        <div className="text-xs text-gray-600">Xử lý hỗ trợ, quản lý cộng đồng</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setEditRole('supervisor')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      editRole === 'supervisor'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-gray-900 font-medium">Giám sát viên</div>
                        <div className="text-xs text-gray-600">Quản lý bãi đỗ được phân quyền</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Chọn bãi đỗ <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3 border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                  {parkingLots.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-6">
                      Chưa có bãi đỗ nào thuộc tài khoản admin này
                    </div>
                  ) : (
                    parkingLots.map((lot) => (
                      <div key={lot.code} className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="editParkingLot"
                            checked={editParkingLot === lot.code}
                            onChange={() => setEditParkingLot(lot.code)}
                            className="mt-1 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium mb-1">{lot.name}</div>
                            <div className="text-sm text-gray-600">Mã tham gia: {lot.joinCode || 'N/A'}</div>
                            <div className="text-sm text-gray-600">Mã bãi đỗ: {lot.code}</div>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="font-bold text-gray-900">Cấp quyền đổi bãi</div>
                      <div className="text-sm text-gray-600">
                        Cho phép nhân viên chuyển bãi khi cần
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditCanSwitchLots(!editCanSwitchLots)}
                    className={`relative w-16 h-8 rounded-full transition ${
                      editCanSwitchLots ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                        editCanSwitchLots ? 'translate-x-8' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div
                className={`rounded-lg p-4 ${
                  editRole === 'supervisor'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div
                  className={`text-sm ${
                    editRole === 'supervisor' ? 'text-green-800' : 'text-blue-800'
                  }`}
                >
                  {editRole === 'supervisor' ? (
                    <>
                      <strong>Giám sát viên</strong> sẽ được cập nhật trực tiếp:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Đổi <strong>chucnang</strong> sang <strong>supervisor</strong></li>
                        <li>Cập nhật tên hiển thị ở <strong>ctnhanvien.hoten</strong></li>
                        <li>Cập nhật bãi đỗ đang phụ trách</li>
                        <li>Cập nhật quyền đổi bãi nếu bật</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <strong>Nhân viên hỗ trợ</strong> sẽ được cập nhật trực tiếp:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Đổi <strong>chucnang</strong> sang <strong>support</strong></li>
                        <li>Cập nhật tên hiển thị ở <strong>ctnhanvien.hoten</strong></li>
                        <li>Cập nhật bãi đỗ đang phụ trách</li>
                        <li>Cập nhật quyền đổi bãi nếu bật</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditStaff(false);
                  resetEditForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEditStaff}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};