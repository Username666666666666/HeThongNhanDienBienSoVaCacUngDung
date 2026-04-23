import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Key,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Camera,
  Save,
  Pencil,
  Lock,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

interface SupportProfileData {
  manguoidung: string;
  email: string;
  hoten: string;
  sodt: string;
  anhdaidien: string;
  mabaido: string | null;
  maadmin: string | null;
  duocchuyenbai: boolean;
  ngayvaolam: string | null;
  mapinnguoidung: string | null;
  chucnang: string | null;
  manhanvien: string | null;
  nghiviec: boolean | null;
}

interface ParkingLot {
  code: string;
  name: string;
  joinCode: string;
  address: string | null;
}

const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SupportProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const [profile, setProfile] = useState<SupportProfileData | null>(null);
  const [availableLots, setAvailableLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [adminPin, setAdminPin] = useState('');

  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const [editing, setEditing] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState<'verify' | 'create' | 'change' | 'roleBack'>('verify');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPinValue, setShowPinValue] = useState(false);

  const currentLot = useMemo(() => {
    return availableLots.find((lot) => lot.code === profile?.mabaido) || null;
  }, [availableLots, profile?.mabaido]);

  const formatDate = (value: string | null) => {
    if (!value) return 'Chưa có';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa có';
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  const validateEmail = (email: string) => gmailRegex.test(email.trim());

  const getAvatarUrl = (value: string | null | undefined) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;

    const { data } = supabase.storage.from('avatars').getPublicUrl(value);
    return data?.publicUrl || '';
  };

  const resetPinModal = () => {
    setShowPinModal(false);
    setShowPinValue(false);
    setPinAction('verify');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
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

      const { data: userRow, error: userError } = await supabase
        .from('nguoidung')
        .select('manguoidung, email, tennguoidung, chucnang, mapinnguoidung')
        .eq('manguoidung', user.id)
        .maybeSingle();

      if (userError) {
        console.error('LOAD NGUOIDUNG ERROR:', userError);
        toast.error('Lỗi tải thông tin tài khoản');
        return;
      }

      const { data: staffRow, error: staffError } = await supabase
        .from('ctnhanvien')
        .select(
          'manguoidung, sodt, anhdaidien, mabaido, maadmin, duocchuyenbai, ngayvaolam, hoten, manhanvien, nghiviec'
        )
        .eq('manguoidung', user.id)
        .maybeSingle();

      if (staffError) {
        console.error('LOAD CTNHANVIEN ERROR:', staffError);
        toast.error('Lỗi tải thông tin nhân viên');
        return;
      }

      const mergedProfile: SupportProfileData = {
        manguoidung: user.id,
        email: userRow?.email || user.email || '',
        hoten: staffRow?.hoten || userRow?.tennguoidung || '',
        sodt: staffRow?.sodt || '',
        anhdaidien: staffRow?.anhdaidien || '',
        mabaido: staffRow?.mabaido || null,
        maadmin: staffRow?.maadmin || null,
        duocchuyenbai: staffRow?.duocchuyenbai ?? false,
        ngayvaolam: staffRow?.ngayvaolam || null,
        mapinnguoidung: userRow?.mapinnguoidung || null,
        chucnang: userRow?.chucnang || null,
        manhanvien: staffRow?.manhanvien || null,
        nghiviec: staffRow?.nghiviec ?? null,
      };

      setProfile(mergedProfile);
      setEditEmail(mergedProfile.email);
      setEditPhone(mergedProfile.sodt);
      setAvatarPreview(getAvatarUrl(mergedProfile.anhdaidien));

      if (mergedProfile.maadmin) {
        const { data: lotsData, error: lotsError } = await supabase
          .from('baido')
          .select('mabaido, tenbaido, mathamgia, diachi')
          .eq('manguoidung', mergedProfile.maadmin)
          .order('tenbaido', { ascending: true });

        if (lotsError) {
          console.error('LOAD BAIDO ERROR:', lotsError);
          toast.error('Lỗi tải danh sách bãi đỗ');
          return;
        }

        const mappedLots: ParkingLot[] = (lotsData ?? []).map((item: any) => ({
          code: item.mabaido,
          name: item.tenbaido,
          joinCode: item.mathamgia,
          address: item.diachi || null,
        }));

        setAvailableLots(mappedLots);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const openEditFlow = () => {
    if (!profile) return;
    setPinAction(profile.mapinnguoidung ? 'verify' : 'create');
    setShowPinModal(true);
    setShowPinValue(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const openChangePin = () => {
    setPinAction(profile?.mapinnguoidung ? 'change' : 'create');
    setShowPinModal(true);
    setShowPinValue(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const openRoleBackFlow = () => {
    if (!profile) return;
    setPinAction('roleBack');
    setShowPinModal(true);
    setShowPinValue(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
  };

  const handlePinConfirm = async () => {
    if (!profile) return;

    const storedPin = profile.mapinnguoidung?.trim() || '';

    if (pinAction === 'verify') {
      if (!storedPin) {
        toast.error('Tài khoản chưa tạo mã PIN, hãy tạo mới trước');
        setPinAction('create');
        return;
      }

      if (currentPinInput.length !== 8) {
        toast.error('Mã PIN phải có 8 chữ số');
        return;
      }

      if (currentPinInput !== storedPin) {
        toast.error('Mã PIN không đúng');
        return;
      }

      toast.success('Xác thực thành công');
      setEditing(true);
      resetPinModal();
      return;
    }

    if (pinAction === 'create') {
      if (newPinInput.length !== 8) {
        toast.error('Mã PIN mới phải có 8 chữ số');
        return;
      }

      if (newPinInput !== confirmPinInput) {
        toast.error('Xác nhận PIN không khớp');
        return;
      }

      const { error } = await supabase
        .from('nguoidung')
        .update({ mapinnguoidung: newPinInput })
        .eq('manguoidung', profile.manguoidung);

      if (error) {
        console.error('CREATE PIN ERROR:', error);
        toast.error('Không thể tạo mã PIN');
        return;
      }

      setProfile((prev) => (prev ? { ...prev, mapinnguoidung: newPinInput } : prev));
      toast.success('Đã tạo mã PIN');
      setEditing(true);
      resetPinModal();
      return;
    }

    if (pinAction === 'change') {
      if (!storedPin) {
        toast.error('Chưa có mã PIN cũ để xác thực');
        return;
      }

      if (currentPinInput.length !== 8) {
        toast.error('Mã PIN cũ phải có 8 chữ số');
        return;
      }

      if (currentPinInput !== storedPin) {
        toast.error('Mã PIN cũ không đúng');
        return;
      }

      if (newPinInput.length !== 8) {
        toast.error('Mã PIN mới phải có 8 chữ số');
        return;
      }

      if (newPinInput !== confirmPinInput) {
        toast.error('Xác nhận PIN không khớp');
        return;
      }

      const { error } = await supabase
        .from('nguoidung')
        .update({ mapinnguoidung: newPinInput })
        .eq('manguoidung', profile.manguoidung);

      if (error) {
        console.error('CHANGE PIN ERROR:', error);
        toast.error('Không thể đổi mã PIN');
        return;
      }

      setProfile((prev) => (prev ? { ...prev, mapinnguoidung: newPinInput } : prev));
      toast.success('Đã đổi mã PIN');
      resetPinModal();
      return;
    }

    if (pinAction === 'roleBack') {
      if (!storedPin) {
        toast.error('Tài khoản chưa có mã PIN, hãy tạo PIN trước');
        return;
      }

      if (currentPinInput.length !== 8) {
        toast.error('Mã PIN phải có 8 chữ số');
        return;
      }

      if (currentPinInput !== storedPin) {
        toast.error('Mã PIN không đúng');
        return;
      }

      toast.success('Xác thực thành công');
      resetPinModal();
      navigate('/owner');
      return;
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    const email = editEmail.trim();
    const phone = editPhone.trim();

    if (!email) {
      toast.error('Email không được để trống');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email phải đúng định dạng ví dụ: user@domain.com');
      return;
    }

    setSavingProfile(true);
    try {
      const { error: userError } = await supabase
        .from('nguoidung')
        .update({
          email,
        })
        .eq('manguoidung', profile.manguoidung);

      if (userError) {
        console.error('UPDATE NGUOIDUNG ERROR:', userError);
        toast.error('Không thể cập nhật thông tin tài khoản');
        return;
      }

      const { error: staffError } = await supabase
        .from('ctnhanvien')
        .update({
          sodt: phone,
        })
        .eq('manguoidung', profile.manguoidung);

      if (staffError) {
        console.error('UPDATE CTNHANVIEN ERROR:', staffError);
        toast.error('Không thể cập nhật số điện thoại');
        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              email,
              sodt: phone,
            }
          : prev
      );

      toast.success('Đã lưu hồ sơ');
      setEditing(false);
      await loadProfile();
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!profile) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `support/${profile.manguoidung}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('UPLOAD AVATAR ERROR:', uploadError);
        toast.error('Upload avatar thất bại');
        return;
      }

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;

      const { error: updateError } = await supabase
        .from('ctnhanvien')
        .update({ anhdaidien: publicUrl })
        .eq('manguoidung', profile.manguoidung);

      if (updateError) {
        console.error('SAVE AVATAR ERROR:', updateError);
        toast.error('Đã upload nhưng chưa lưu được avatar');
        return;
      }

      setProfile((prev) => (prev ? { ...prev, anhdaidien: publicUrl } : prev));
      setAvatarPreview(publicUrl);
      toast.success('Đã cập nhật ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const correctAdminPin = async () => {
    if (!profile?.maadmin) return null;

    const { data, error } = await supabase
      .from('ctadmin')
      .select('mapinadmin')
      .eq('manguoidung', profile.maadmin)
      .maybeSingle();

    if (error) {
      console.error('LOAD ADMIN PIN ERROR:', error);
      return null;
    }

    return data?.mapinadmin || null;
  };

  const handleSwitchLot = async () => {
    if (!selectedLot) {
      toast.error('Vui lòng chọn bãi đỗ');
      return;
    }

    if (adminPin.length !== 8) {
      toast.error('Mã PIN phải có 8 chữ số');
      return;
    }

    const pin = await correctAdminPin();
    if (!pin) {
      toast.error('Không tìm thấy PIN của admin');
      return;
    }

    if (adminPin !== pin) {
      toast.error('Mã PIN Admin không đúng');
      return;
    }

    if (!profile) return;

    const { error } = await supabase
      .from('ctnhanvien')
      .update({ mabaido: selectedLot })
      .eq('manguoidung', profile.manguoidung);

    if (error) {
      console.error('SWITCH LOT ERROR:', error);
      toast.error('Không thể chuyển bãi');
      return;
    }

    const lot = availableLots.find((l) => l.code === selectedLot);
    toast.success(`Đã chuyển sang ${lot?.name || 'bãi mới'}`);

    setShowSwitchModal(false);
    setAdminPin('');
    setSelectedLot('');
    await loadProfile();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-3">
          <div className="w-5 h-5 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/support')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex-1">
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <User className="w-8 h-8" />
                Hồ sơ hỗ trợ
              </h1>
              <p className="text-pink-100 text-sm">
                Thông tin tài khoản và bãi đỗ được phân quyền
              </p>
            </div>

            <button
              onClick={openRoleBackFlow}
              className="bg-white/10 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/20 transition flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Về trang người dùng
            </button>

            <button
              onClick={handleLogout}
              className="bg-white text-pink-700 px-5 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="relative w-28 h-28 md:w-32 md:h-32">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-14 h-14 text-white" />
                )}
              </div>

              {editing && (
                <label className="absolute right-0 bottom-0 bg-white rounded-full shadow-md p-2 cursor-pointer hover:bg-gray-50 transition">
                  <Camera className="w-4 h-4 text-gray-700" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUploadAvatar(file);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {profile?.hoten?.trim() || 'Chưa có tên'}
                </h2>
                <span className="px-3 py-1 rounded-full text-sm bg-pink-50 border border-pink-200 text-pink-700">
                  Nhân viên hỗ trợ
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  📧 Email: <span className="font-semibold">{profile?.email || 'Chưa có'}</span>
                </div>
                <div>
                  📱 Điện thoại: <span className="font-semibold">{profile?.sodt || 'Chưa có'}</span>
                </div>
                <div>
                  📅 Ngày vào làm:{' '}
                  <span className="font-semibold">{formatDate(profile?.ngayvaolam || null)}</span>
                </div>
                <div>
                  🆔 Mã nhân viên:{' '}
                  <span className="font-semibold font-mono">{profile?.manhanvien || 'Chưa có'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-pink-50 p-6 rounded-2xl border border-pink-200">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-6 h-6 text-pink-600" />
                <h3 className="text-lg font-bold text-gray-900">Bãi đỗ hiện tại</h3>
              </div>

              <div className="text-2xl font-bold text-pink-700 mb-2">
                {currentLot?.name || 'Chưa gán bãi'}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div>Mã tham gia: {currentLot?.joinCode || 'N/A'}</div>
                <div>Địa chỉ: {currentLot?.address || 'Chưa có'}</div>
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                profile?.duocchuyenbai
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Key className="w-6 h-6 text-pink-600" />
                <h3 className="text-lg font-bold text-gray-900">Quyền chuyển bãi</h3>
              </div>

              {profile?.duocchuyenbai ? (
                <>
                  <div className="text-xl font-bold text-rose-700 mb-2">✅ Đã được cấp phép</div>
                  <div className="text-sm text-gray-600">
                    Nhân viên có thể đổi sang các bãi đỗ do admin này cấu hình.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-red-700 mb-2">❌ Chưa được cấp phép</div>
                  <div className="text-sm text-gray-600">
                    Muốn chuyển bãi phải được admin bật quyền ở ctnhanvien.duocchuyenbai.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Pencil className="w-6 h-6 text-pink-600" />
            <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên nhân viên
              </label>
              <input
                disabled
                value={profile?.hoten || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 outline-none"
                placeholder="Tên nhân viên"
              />
              <p className="text-xs text-gray-500 mt-1">Tên này lấy từ bảng ctnhanvien và không sửa được.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                disabled={!editing}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="user@domain.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Bắt buộc đúng định dạng <span className="font-semibold">user@domain.com</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
              <input
                disabled={!editing}
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 disabled:bg-gray-100 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    if (profile) {
                      setEditEmail(profile.email);
                      setEditPhone(profile.sodt);
                    }
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || uploadingAvatar}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </>
            ) : (
              <button
                onClick={openEditFlow}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg transition"
              >
                <Lock className="w-5 h-5" />
                Mở khóa để chỉnh sửa
              </button>
            )}

            <button
              onClick={openChangePin}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 font-semibold hover:bg-pink-100 transition"
            >
              <Key className="w-5 h-5" />
              {profile?.mapinnguoidung ? 'Đổi PIN người dùng' : 'Tạo PIN người dùng'}
            </button>
          </div>
        </div>

        {profile?.duocchuyenbai && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-pink-600" />
              <h3 className="text-2xl font-bold text-gray-900">Chuyển đổi bãi đỗ</h3>
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-pink-800">
                  Nhập mã PIN admin để chuyển sang bãi khác. Danh sách bãi chỉ lấy từ các bãi có cùng
                  <strong> manguoidung </strong> với admin đang quản lý bạn.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSwitchModal(true)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-4 rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 transition shadow-lg flex items-center justify-center gap-3 text-lg"
            >
              <RefreshCw className="w-6 h-6" />
              Chọn bãi đỗ khác
            </button>
          </div>
        )}
      </div>

      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Chuyển đổi bãi đỗ
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Chọn bãi đỗ
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {availableLots.map((lot) => (
                    <button
                      key={lot.code}
                      type="button"
                      onClick={() => setSelectedLot(lot.code)}
                      className={`text-left p-4 rounded-xl border-2 transition ${
                        selectedLot === lot.code
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{lot.name}</div>
                      <div className="text-sm text-gray-600 mt-1">Mã tham gia: {lot.joinCode}</div>
                      <div className="text-sm text-gray-600">Địa chỉ: {lot.address || 'Chưa có'}</div>
                    </button>
                  ))}
                </div>

                {availableLots.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-6">
                    Chưa có bãi đỗ nào được gán cho admin này
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Key className="w-4 h-4 inline mr-1" />
                  Mã PIN Admin (8 chữ số)
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder=""
                  maxLength={8}
                  autoComplete="new-password"
                  name="admin-pin-support"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-center text-2xl tracking-widest font-bold"
                />
                <div className="text-xs text-gray-500 text-center mt-2">
                  {adminPin.length}/8 ký tự
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowSwitchModal(false);
                  setAdminPin('');
                  setSelectedLot('');
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSwitchLot}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {pinAction === 'verify'
                  ? 'Vui lòng nhập mã PIN người dùng'
                  : pinAction === 'create'
                    ? 'Tạo mã PIN người dùng'
                    : pinAction === 'change'
                      ? 'Đổi mã PIN người dùng'
                      : 'Xác thực để chuyển về trang người dùng'}
              </h2>
              <button onClick={resetPinModal} className="p-2 rounded-lg hover:bg-gray-100">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {pinAction !== 'create' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã PIN hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showPinValue ? 'text' : 'password'}
                      value={currentPinInput}
                      onChange={(e) =>
                        setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))
                      }
                      maxLength={8}
                      autoComplete="new-password"
                      name="current-pin-support"
                      inputMode="numeric"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none font-mono tracking-widest text-center"
                      placeholder={showPinValue ? '' : '••••••••'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinValue((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPinValue ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {(pinAction === 'create' || pinAction === 'change') && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PIN mới</label>
                    <input
                      type="password"
                      value={newPinInput}
                      onChange={(e) =>
                        setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))
                      }
                      maxLength={8}
                      autoComplete="new-password"
                      name="new-pin-support"
                      inputMode="numeric"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none font-mono tracking-widest text-center"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận PIN mới
                    </label>
                    <input
                      type="password"
                      value={confirmPinInput}
                      onChange={(e) =>
                        setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))
                      }
                      maxLength={8}
                      autoComplete="new-password"
                      name="confirm-pin-support"
                      inputMode="numeric"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none font-mono tracking-widest text-center"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              {pinAction === 'create' && (
                <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 text-sm text-pink-800">
                  Đây là lần đầu tạo PIN. Từ lần sau, mỗi lần sửa hồ sơ sẽ cần nhập PIN này trước.
                </div>
              )}

              {pinAction === 'change' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Đổi PIN sẽ cần PIN cũ để xác thực trước.
                </div>
              )}

              {pinAction === 'roleBack' && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                  Nhập PIN để quay lại trang nhân viên hỗ trợ.
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetPinModal}
                className="flex-1 px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handlePinConfirm}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg transition"
              >
                {pinAction === 'verify'
                  ? 'Xác thực'
                  : pinAction === 'create'
                    ? 'Tạo PIN'
                    : pinAction === 'change'
                      ? 'Đổi PIN'
                      : 'Chuyển trang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};