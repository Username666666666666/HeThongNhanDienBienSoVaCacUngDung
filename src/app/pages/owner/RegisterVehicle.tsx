import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Upload, CheckCircle, AlertCircle, User, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

type UploadField =
  | 'cccdFront'
  | 'cccdBack'
  | 'gplxFront'
  | 'gplxBack'
  | 'regFront'
  | 'regBack'
  | 'portrait';

type FormDataState = {
  fullName: string;
  phone: string;
  cccd: string;
  driverLicense: string;
  vehicleType: string;
  plateNumber: string;
  brand: string;
  vehicleModel: string;
  cccdFront: File | null;
  cccdBack: File | null;
  gplxFront: File | null;
  gplxBack: File | null;
  regFront: File | null;
  regBack: File | null;
  portrait: File | null;
};

export const RegisterVehicle = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    // Thông tin người dùng
    fullName: '',
    phone: '',
    cccd: '',
    driverLicense: '',

    // Thông tin xe
    vehicleType: '',
    plateNumber: '',
    brand: '',
    vehicleModel: '',

    // Tài liệu
    cccdFront: null,
    cccdBack: null,
    gplxFront: null,
    gplxBack: null,
    regFront: null,
    regBack: null,
    portrait: null,
  });

  const vehicleTypes = useMemo(
    () => [
      { value: 'car', label: 'Xe ô tô', icon: '🚗' },
      { value: 'motorcycle', label: 'Xe máy', icon: '🏍️' },
    ],
    []
  );

  const uploadLabels: Record<UploadField, { title: string; required?: boolean; hint: string }> = {
    cccdFront: { title: 'Ảnh CCCD/CMND mặt trước', required: true, hint: 'Ảnh rõ nét, thấy đầy đủ số và ảnh chân dung' },
    cccdBack: { title: 'Ảnh CCCD/CMND mặt sau', required: true, hint: 'Ảnh rõ các trường thông tin ở mặt sau' },
    gplxFront: { title: 'Ảnh GPLX mặt trước', hint: 'Không bắt buộc, nhưng nên tải lên để xác thực nhanh hơn' },
    gplxBack: { title: 'Ảnh GPLX mặt sau', hint: 'Không bắt buộc, nếu có giấy phép lái xe' },
    regFront: { title: 'Ảnh giấy đăng ký xe mặt trước', required: true, hint: 'Ảnh chính chủ, rõ thông tin biển số' },
    regBack: { title: 'Ảnh giấy đăng ký xe mặt sau', required: true, hint: 'Ảnh mặt sau của giấy đăng ký xe' },
    portrait: { title: 'Ảnh chân dung người đăng ký', required: true, hint: 'Ảnh chân dung rõ mặt, không che khuất' },
  };

  const setField = <K extends keyof FormDataState>(field: K, value: FormDataState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: UploadField, file: File | null) => {
    if (file) {
      // Theo yêu cầu cũ, vẫn giữ giới hạn file hợp lý; nâng lên 10MB để khớp thông báo giao diện.
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File quá lớn! Tối đa 10MB');
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        toast.error('Chỉ chấp nhận JPG, PNG hoặc PDF');
        return;
      }
    }

    setField(field, file);
  };

  const uploadFile = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;

    const { data, error } = await supabase.storage.from('PhuongTien').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw error;
    return data.path;
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.cccd.trim()) {
      toast.error('Vui lòng nhập đủ thông tin người dùng');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.vehicleType || !formData.plateNumber.trim() || !formData.brand.trim() || !formData.vehicleModel.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin xe');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const requiredFiles: Array<[UploadField, string]> = [
      ['cccdFront', 'Ảnh CCCD/CMND mặt trước'],
      ['cccdBack', 'Ảnh CCCD/CMND mặt sau'],
      ['regFront', 'Ảnh giấy đăng ký xe mặt trước'],
      ['regBack', 'Ảnh giấy đăng ký xe mặt sau'],
      ['portrait', 'Ảnh chân dung người đăng ký'],
    ];

    const missing = requiredFiles.filter(([field]) => !formData[field]);
    if (missing.length > 0) {
      toast.error(`Thiếu tài liệu bắt buộc: ${missing[0][1]}`);
      return false;
    }

    return true;
  };

const handleContinue = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    toast.error('Bạn cần đăng nhập để đăng ký xe');
    return;
  }

  if (step === 1) {
    if (!validateStep1()) return;
    setStep(2);
    return;
  }

  if (step === 2) {
    if (!validateStep2()) return;
    setStep(3);
    return;
  }

  if (step === 3) {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const maphuongtien = `PT-${Date.now()}`;

      const [pathCccdFront, pathCccdBack, pathRegFront, pathRegBack, pathPortrait, pathGplxFront, pathGplxBack] =
        await Promise.all([
          uploadFile(formData.cccdFront as File, `${maphuongtien}-cccd-front`),
          uploadFile(formData.cccdBack as File, `${maphuongtien}-cccd-back`),
          uploadFile(formData.regFront as File, `${maphuongtien}-reg-front`),
          uploadFile(formData.regBack as File, `${maphuongtien}-reg-back`),
          uploadFile(formData.portrait as File, `${maphuongtien}-portrait`),
          formData.gplxFront ? uploadFile(formData.gplxFront, `${maphuongtien}-gplx-front`) : Promise.resolve(null),
          formData.gplxBack ? uploadFile(formData.gplxBack, `${maphuongtien}-gplx-back`) : Promise.resolve(null),
        ]);

      const { error } = await supabase.from('phuongtien').insert([
        {
          manguoidung: user.id,
          maphuongtien: maphuongtien,
          tenchuphuongtien: formData.fullName.trim(),
          sodienthoai: formData.phone.trim(),
          socccd: formData.cccd.trim(),
          sogplx: formData.driverLicense.trim() || null,
          maloai: formData.vehicleType,
          bienso: formData.plateNumber.trim().toUpperCase(),
          hangxe: formData.brand.trim(),
          mauxe: formData.vehicleModel.trim(),
          anhcccdmattruoc: pathCccdFront,
          anhcccdmatsau: pathCccdBack,
          anhgplx_mattruoc: pathGplxFront,
          anhgplx_matsau: pathGplxBack,
          anhgiaydangkyxe_mattruoc: pathRegFront,
          anhgiaydangkyxe_matsau: pathRegBack,
          anh_nguoi_dung: pathPortrait,
          trang_thai_xac_thuc: 'Đang xác thực',
        },
      ]);

      if (error) throw error;

      sessionStorage.setItem('toast_message', 'Đăng ký đã gửi xác thực thành công!');
      globalThis.location.replace('/owner');
     
      return;
    } catch (error: any) {
      console.error('Supabase Error:', error);
      const message = error?.details ? `${error.message} (${error.details})` : error?.message || 'Lỗi không xác định';
      toast.error(`Lỗi: ${message}`);
    } finally {
      setLoading(false);
    }
  }
};

  const renderUploadCard = (field: UploadField) => {
    const value = formData[field];
    const meta = uploadLabels[field];

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-all bg-white">
        <label className="block cursor-pointer">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                value ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              {value ? <CheckCircle className="w-7 h-7 text-green-600" /> : <Upload className="w-7 h-7 text-gray-400" />}
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">
                {meta.title} {meta.required ? <span className="text-red-500">*</span> : null}
              </h3>
              <p className="text-sm text-gray-500">{value ? value.name : meta.hint}</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : globalThis.location.replace('/owner'))}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Đăng ký phương tiện</h1>
              <p className="text-blue-100 text-sm">
                Bước {step}/3: {step === 1 ? 'Thông tin người dùng' : step === 2 ? 'Thông tin xe' : 'Tải lên tài liệu'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900">Thông tin người dùng</h2>
                <p className="text-gray-500 text-sm">Vui lòng cung cấp thông tin chính xác</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="0901234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Số CCCD/CMND <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cccd}
                  onChange={(e) => setField('cccd', e.target.value)}
                  placeholder="001234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Số giấy phép lái xe (nếu có)</label>
                <input
                  type="text"
                  value={formData.driverLicense}
                  onChange={(e) => setField('driverLicense', e.target.value)}
                  placeholder="12345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Thông tin sẽ được dùng để tạo hồ sơ xác thực phương tiện</li>
                      <li>Hồ sơ chỉ được sử dụng khi trạng thái chuyển sang “Đã duyệt”</li>
                      <li>Dữ liệu được lưu theo cơ sở dữ liệu hiện tại của hệ thống</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900">Thông tin phương tiện</h2>
                <p className="text-gray-500 text-sm">Chi tiết về xe của bạn</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm mb-3 text-gray-700">
                  Loại xe <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicleTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setField('vehicleType', type.value)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.vehicleType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-sm text-gray-700">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => setField('plateNumber', e.target.value.toUpperCase())}
                  placeholder="30A-12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Hãng xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setField('brand', e.target.value)}
                    placeholder="Honda, Toyota, Yamaha..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Dòng xe cụ thể / màu xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setField('vehicleModel', e.target.value)}
                    placeholder="Vision, Vios, Wave Alpha..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileImage className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900">Tải lên tài liệu</h2>
                <p className="text-gray-500 text-sm">Ảnh rõ nét, đúng mặt giấy tờ và chân dung</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderUploadCard('cccdFront')}
              {renderUploadCard('cccdBack')}
              {renderUploadCard('gplxFront')}
              {renderUploadCard('gplxBack')}
              {renderUploadCard('regFront')}
              {renderUploadCard('regBack')}
              <div className="md:col-span-2">{renderUploadCard('portrait')}</div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Yêu cầu xác thực:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>CCCD/CMND, giấy đăng ký xe và ảnh chân dung là bắt buộc</li>
                    <li>GPLX mặt trước/sau là tùy chọn nhưng nên bổ sung nếu có</li>
                    <li>Sau khi bấm xác thực, trạng thái sẽ chuyển sang “Đang xác thực”</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Đang xử lý...' : step === 3 ? 'Xác thực' : 'Tiếp tục →'}
          </button>
        </div>
      </div>
    </div>
  );
};

