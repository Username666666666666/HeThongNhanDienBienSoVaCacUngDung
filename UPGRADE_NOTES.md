# UPGRADE NOTES

## Mục tiêu
- Nâng cấp trải nghiệm front-end của toàn bộ đồ án.
- Tập trung vào cấu trúc, khả năng bảo trì và luồng người dùng.
- Giữ nguyên phần Supabase backend/auth vì đã hoàn thiện.

## Những thay đổi chính - Giai đoạn 1

### 1. Tối ưu trải nghiệm tải
- Thêm file `src/app/components/LoadingFallback.tsx` để hiển thị giao diện tải rõ ràng và nhất quán.
- Cập nhật `src/app/App.tsx` để sử dụng `LoadingFallback` cho `Suspense` thay vì chỉ hiển thị chuỗi text.

### 2. Cập nhật đường dẫn điều hướng cho role provider
- Sửa `src/app/utils/navigation.ts` để trả về route `'/provider'` khi người dùng có role `provider`.
- Giữ nguyên đường dẫn ổn định cho các role `admin`, `supervisor`, `support`, `owner`.

### 3. Hoàn thiện kiểu người dùng
- Mở rộng `UserRole` trong `src/app/types.ts` bao gồm `provider`.
- Điều này giúp đồng bộ role trong toàn bộ frontend và tránh sai lệch loại khi ứng dụng mở rộng.

### 4. Chuyển side-effect trong trang cộng đồng sang useEffect
- Chuyển logic tự động tham gia cộng đồng (`skipCodeEntry`) từ render trực tiếp sang `useEffect` trong `src/app/pages/Community.tsx`.
- Giảm rủi ro cập nhật state trong quá trình render và cải thiện độ ổn định của React.
- Thêm cơ chế lưu mã cộng đồng vào `localStorage` để giữ trạng thái khi người dùng quay lại trang.

## Những thay đổi chính - Giai đoạn 2

### 5. Thêm Custom Hooks nâng cao
- `src/app/hooks/useModalState.ts` - Quản lý state modal một cách sạch sẽ với open/close/toggle.
- `src/app/hooks/useAsync.ts` - Handle async operations với loading/error/success state tự động.
- `src/app/hooks/useFormState.ts` - Quản lý form state, validation errors, touched fields, và submit handler.

### 6. Tạo lớp tiện ích (Utilities Layer)
- `src/app/utils/formatters.ts` - Các hàm format cho tiền tệ, ngày giờ, số điện thoại Việt Nam.
- `src/app/utils/types.ts` - Định nghĩa TypeScript types tập trung cho các loại dữ liệu thường dùng.

### 7. Tạo Query Helper Layer
- `src/app/service/queryHelper.ts` - Wrapper generic cho các Supabase queries với:
  - Centralized error handling
  - `fetchRecord`, `fetchRecords`, `insertRecord`, `updateRecord`, `deleteRecord`, `upsertRecord`
  - Tránh lặp lại mã xử lý error trong các component.

## Yếu tố kỹ thuật chính
- React + TypeScript + Vite
- React Router v6 cho định tuyến SPA
- Sonner cho thông báo hiển thị nhanh
- Supabase cho xác thực và dữ liệu người dùng (không thay đổi phần backend)
- `zod` để chuẩn hóa xác thực biểu mẫu nơi cần thiết
- Thiết kế UI sử dụng Tailwind CSS và component Radix UI từ bộ sao chép shadcn
- Custom hooks để tái sử dụng logic và quản lý state tốt hơn
- Utility functions để format dữ liệu một cách consistent

## Không chạm vào Supabase
- Biến đổi chỉ giới hạn ở frontend: cấu trúc, điều hướng, loading, giao diện trang cộng đồng, hooks, utilities.
- Các phần Supabase như `src/app/utils/supabase.ts`, `src/app/service/pinService.ts`, `src/app/service/lprService.ts` chỉ có thêm query helper wrapper, không chỉnh sửa logic chính.
