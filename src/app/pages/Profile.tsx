import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Camera,
  Save,
  Pencil,
  Lock,
  Shield,
  Building2,
  Truck,
  Store,
  UserRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase.ts';

type UserRole = 'admin' | 'owner' | 'provider' | 'support' | 'supervisor';
type ProfileDetailTable = 'ctadmin' | 'ctchuxe' | 'ctnhacungcap';

interface BaseProfile {
  manguoidung: string;
  email: string;
  tennguoidung: string;
  chucnang: UserRole;
  mapinnguoidung: string | null;
}

interface DetailProfile {
  sodt: string;
  diachi: string;
  anhdaidien: string;
}

interface ProfileState extends BaseProfile, DetailProfile {}

interface DetailConfig {
  table: ProfileDetailTable;
  hasAddress: boolean;
  hasPhone: boolean;
}

const gmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getRoleMeta = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return {
        label: 'Quản trị viên',
        icon: Shield,
        gradient: 'from-rose-600 to-pink-600',
        soft: 'bg-rose-50 border-rose-200',
      };
    case 'owner':
      return {
        label: 'Người dùng',
        icon: Truck,
        gradient: 'from-blue-600 to-indigo-600',
        soft: 'bg-blue-50 border-blue-200',
      };
    case 'provider':
      return {
        label: 'Nhà cung cấp',
        icon: Store,
        gradient: 'from-amber-600 to-orange-600',
        soft: 'bg-amber-50 border-amber-200',
      };
    case 'support':
      return {
        label: 'Nhân viên hỗ trợ',
        icon: UserRound,
        gradient: 'from-pink-600 to-rose-600',
        soft: 'bg-pink-50 border-pink-200',
      };
    case 'supervisor':
    default:
      return {
        label: 'Giám sát viên',
        icon: Building2,
        gradient: 'from-emerald-600 to-teal-600',
        soft: 'bg-emerald-50 border-emerald-200',
      };
  }
};

const getDetailConfig = (role: UserRole): DetailConfig => {
  switch (role) {
    case 'admin':
      return { table: 'ctadmin', hasAddress: true, hasPhone: true };
    case 'provider':
      return { table: 'ctnhacungcap', hasAddress: true, hasPhone: true };
    case 'owner':
    case 'support':
    case 'supervisor':
    default:
      return { table: 'ctchuxe', hasAddress: true, hasPhone: true };
  }
};

export const Profile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinValue, setShowPinValue] = useState(false);
  const [pinAction, setPinAction] = useState<'verify' | 'create' | 'change' | 'roleBack'>('verify');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');

  const roleMeta = useMemo(() => getRoleMeta(profile?.chucnang || 'owner'), [profile?.chucnang]);
  const detailConfig = useMemo(() => getDetailConfig(profile?.chucnang || 'owner'), [profile?.chucnang]);

  const isEmployeeRole = profile?.chucnang === 'support' || profile?.chucnang === 'supervisor';
  const roleBackTarget = profile?.chucnang === 'supervisor' ? '/supervisor' : '/support';
  const roleBackLabel = profile?.chucnang === 'supervisor' ? 'giám sát viên' : 'nhân viên hỗ trợ';

  const formatAvatarUrl = (value: string | null | undefined) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const { data } = supabase.storage.from('avatars').getPublicUrl(value);
    return data.publicUrl || '';
  };

  const validateEmail = (email: string) => gmailRegex.test(email.trim());

  const resetPinModal = () => {
    setShowPinModal(false);
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinAction('verify');
    setShowPinValue(false);
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

      if (userError || !userRow) {
        console.error('LOAD NGUOIDUNG ERROR:', userError);
        toast.error('Lỗi tải thông tin người dùng');
        return;
      }

      const role = (userRow.chucnang || 'owner') as UserRole;
      const config = getDetailConfig(role);

      const { data: detailRow, error: detailError } = await supabase
        .from(config.table)
        .select('sodt, diachi, anhdaidien')
        .eq('manguoidung', user.id)
        .maybeSingle();

      if (detailError) {
        console.error('LOAD DETAIL ERROR:', detailError);
        toast.error('Lỗi tải chi tiết hồ sơ');
        return;
      }

      const merged: ProfileState = {
        manguoidung: userRow.manguoidung,
        email: userRow.email || user.email || '',
        tennguoidung: userRow.tennguoidung || '',
        chucnang: role,
        mapinnguoidung: userRow.mapinnguoidung || null,
        sodt: detailRow?.sodt || '',
        diachi: detailRow?.diachi || '',
        anhdaidien: detailRow?.anhdaidien || '',
      };

      setProfile(merged);
      setEditName(merged.tennguoidung);
      setEditEmail(merged.email);
      setEditPhone(merged.sodt);
      setEditAddress(merged.diachi);
      setAvatarPreview(formatAvatarUrl(merged.anhdaidien));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const unlockEdit = () => {
    if (!profile) return;

    if (!profile.mapinnguoidung) {
      setPinAction('create');
    } else {
      setPinAction('verify');
    }

    setShowPinModal(true);
  };

  const handleGoBackToRolePage = () => {
    if (!profile) return;

    if (!profile.mapinnguoidung?.trim()) {
      toast.error('Tài khoản chưa tạo mã PIN, hãy tạo mới trước');
      return;
    }

    setPinAction('roleBack');
    setShowPinModal(true);
  };

  const handleConfirmPin = async () => {
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

    if (pinAction === 'roleBack') {
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
      navigate(roleBackTarget);
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
  };

  const handleSave = async () => {
    if (!profile) return;

    const name = editName.trim();
    const email = editEmail.trim();
    const phone = editPhone.trim();
    const address = editAddress.trim();

    if (!name) {
      toast.error('Tên người dùng không được để trống');
      return;
    }

    if (!email) {
      toast.error('Email không được để trống');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email phải đúng định dạng ví dụ: user@domain.com');
      return;
    }

    if (detailConfig.hasAddress && !address) {
      toast.error('Địa chỉ không được để trống');
      return;
    }

    setSaving(true);
    try {
      const { error: userError } = await supabase
        .from('nguoidung')
        .update({
          tennguoidung: name,
          email,
        })
        .eq('manguoidung', profile.manguoidung);

      if (userError) {
        console.error('UPDATE NGUOIDUNG ERROR:', userError);
        toast.error('Không thể cập nhật bảng người dùng');
        return;
      }

      const updatePayload: Record<string, string> = {
        sodt: phone,
        anhdaidien: profile.anhdaidien || '',
      };

      if (detailConfig.hasAddress) {
        updatePayload.diachi = address;
      }

      const { error: detailError } = await supabase
        .from(detailConfig.table)
        .upsert(
          {
            manguoidung: profile.manguoidung,
            ...updatePayload,
          },
          { onConflict: 'manguoidung' }
        );

      if (detailError) {
        console.error('UPDATE DETAIL ERROR:', detailError);
        toast.error('Không thể cập nhật chi tiết hồ sơ');
        return;
      }

      setEditing(false);
      toast.success('Đã lưu hồ sơ');
      await loadProfile();
    } finally {
      setSaving(false);
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
      const filePath = `${profile.chucnang}/${profile.manguoidung}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
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

      const avatarPayload: Record<string, string> = {
        manguoidung: profile.manguoidung,
        sodt: profile.sodt,
        anhdaidien: publicUrl,
      };

      if (detailConfig.hasAddress) {
        avatarPayload.diachi = profile.diachi || '';
      }

      const { error: detailError } = await supabase
        .from(detailConfig.table)
        .upsert(avatarPayload, { onConflict: 'manguoidung' });

      if (detailError) {
        console.error('SAVE AVATAR ERROR:', detailError);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  const AvatarIcon = roleMeta.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className={`bg-gradient-to-r ${roleMeta.gradient} text-white shadow-xl`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex-1">
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <AvatarIcon className="w-8 h-8" />
                Hồ sơ cá nhân
              </h1>
              <p className="text-white/90 text-sm">
                {roleMeta.label} • thông tin tài khoản và chi tiết hồ sơ
              </p>
            </div>

            {isEmployeeRole && (
              <button
                onClick={handleGoBackToRolePage}
                className="bg-white/15 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/20 hover:shadow-lg transition flex items-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                Về trang {roleBackLabel}
              </button>
            )}

            <button
              onClick={unlockEdit}
              className="bg-white text-gray-900 px-5 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="relative w-28 h-28 md:w-32 md:h-32">
              <div
                className={`w-full h-full rounded-full overflow-hidden bg-gradient-to-br ${roleMeta.gradient} flex items-center justify-center`}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <AvatarIcon className="w-14 h-14 text-white" />
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
                  {profile?.tennguoidung?.trim() || 'Chưa có tên'}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm ${roleMeta.soft} border`}>
                  {roleMeta.label}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  📧 Email: <span className="font-semibold">{profile?.email || 'Chưa có'}</span>
                </div>
                <div>
                  📱 Số điện thoại: <span className="font-semibold">{profile?.sodt || 'Chưa có'}</span>
                </div>
                <div>
                  🆔 Mã người dùng:{' '}
                  <span className="font-semibold font-mono">{profile?.manguoidung || 'Chưa có'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${roleMeta.soft} border rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-3">
                <User className="w-6 h-6 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">Thông tin cơ bản</h3>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div>Họ tên: {profile?.tennguoidung || 'Chưa có'}</div>
                <div>Email: {profile?.email || 'Chưa có'}</div>
                <div>Điện thoại: {profile?.sodt || 'Chưa có'}</div>
                {detailConfig.hasAddress && <div>Địa chỉ: {profile?.diachi || 'Chưa có'}</div>}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-6 h-6 text-pink-600" />
                <h3 className="text-lg font-bold text-gray-900">Mã PIN người dùng</h3>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                PIN này được dùng để mở khóa chỉnh sửa hồ sơ và quay về trang quản lý tương ứng.
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-mono">
                  {profile?.mapinnguoidung ? 'Đã được tạo' : 'Chưa tạo mã PIN'}
                </div>

                <button
                  onClick={() => {
                    if (profile?.mapinnguoidung) {
                      setPinAction('change');
                    } else {
                      setPinAction('create');
                    }
                    setShowPinModal(true);
                  }}
                  className="px-4 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition"
                >
                  {profile?.mapinnguoidung ? 'Đổi PIN' : 'Tạo PIN'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Pencil className="w-6 h-6 text-pink-600" />
            <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên</label>
              <input
                disabled={!editing}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="Nhập họ tên"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                disabled={!editing}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="name@domain.com"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {detailConfig.hasAddress ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                <input
                  disabled={!editing}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 disabled:bg-gray-100 focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                <input
                  disabled
                  value="Không áp dụng cho role này"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    if (profile) {
                      setEditName(profile.tennguoidung);
                      setEditEmail(profile.email);
                      setEditPhone(profile.sodt);
                      setEditAddress(profile.diachi);
                    }
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploadingAvatar}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </>
            ) : (
              <button
                onClick={unlockEdit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg transition"
              >
                <Lock className="w-5 h-5" />
                Mở khóa để chỉnh sửa
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-center text-red-500 text-sm hover:underline pb-6"
        >
          Đăng xuất
        </button>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {pinAction === 'verify'
                  ? 'Vui lòng nhập mã PIN người dùng'
                  : pinAction === 'create'
                    ? 'Tạo mã PIN người dùng'
                    : pinAction === 'change'
                      ? 'Đổi mã PIN người dùng'
                      : `Nhập mã PIN để quay về trang ${roleBackLabel}`}
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
                      onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      maxLength={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none font-mono tracking-widest text-center"
                      placeholder=""
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
                      onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      maxLength={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none font-mono tracking-widest text-center"
                      placeholder={showPinValue ? '' : '••••••••'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận PIN mới
                    </label>
                    <input
                      type="password"
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      maxLength={8}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none font-mono tracking-widest text-center"
                      placeholder={showPinValue ? '' : '••••••••'}
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
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Xác thực PIN để quay về trang {roleBackLabel}.
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
                onClick={handleConfirmPin}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold hover:shadow-lg transition"
              >
                {pinAction === 'verify'
                  ? 'Xác thực'
                  : pinAction === 'create'
                    ? 'Tạo PIN'
                    : pinAction === 'change'
                      ? 'Đổi PIN'
                      : 'Xác thực và chuyển'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};