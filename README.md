# Hệ thống quản lý bãi đỗ xe thông minh

Ứng dụng này là một dự án quản lý bãi đỗ xe đa vai trò, bao gồm cả chủ xe, giám sát, quản trị, nhà cung cấp và nhân viên hỗ trợ.

## Nội dung chính
- Quản lý đăng nhập / đăng ký / quên mật khẩu.
- Quản lý profile người dùng và bảo mật PIN.
- Duyệt bãi đỗ, chọn khu vực, chọn vị trí và đăng ký đỗ xe.
- Quản lý ca trực, cổng ra vào và giám sát camera cho giám sát viên.
- Dashboard admin để quản lý bãi đỗ, nhân sự, dịch vụ và camera.
- Hệ thống cộng đồng, đánh giá, báo cáo trộm cắp, chat và trò chơi kiếm xu.
- Cấu trúc route bảo mật theo role và cơ chế lazy load trang.

## Cài đặt

1. Chạy `npm install` để cài phụ thuộc.
2. Chạy `npm run dev` để khởi động ứng dụng.

## Tài liệu

- **`UPGRADE_NOTES.md`** — Mô tả các thay đổi cải tiến giai đoạn 1 & 2 và yếu tố kỹ thuật.
- **`PROJECT_FUNCTIONALITY.md`** — Liệt kê toàn bộ chức năng và module trong dự án.
- **`DEVELOPER_GUIDE.md`** — Hướng dẫn sử dụng custom hooks, utilities, và best practices.

## Thông tin kỹ thuật

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS + shadcn UI components
- **Routing:** React Router v6
- **State Management:** Context API + Custom Hooks
- **Backend:** Supabase (xác thực + dữ liệu người dùng)
- **Validation:** Zod
- **Notifications:** Sonner

## Cấu trúc thư mục chính

```
src/app/
├── hooks/              # Custom React hooks
├── utils/              # Utility functions và types
├── service/            # Service layer (Supabase queries)
├── components/         # UI components
├── pages/              # Page components theo vai trò
├── context/            # React Context
├── constants/          # Constants
├── types/              # TypeScript type definitions
├── store/              # Mock data
└── styles/             # CSS styles
```

## Lưu ý quan trọng

- Phần Supabase backend/auth đã hoàn thiện và không chỉnh sửa trong cải tiến này.
- Tất cả cải tiến tập trung vào front-end: structure, state management, utilities, hooks.
- Sử dụng index.ts trong hooks/ và utils/ để dễ import các resources.

## Những cải tiến chính

✅ Custom hooks (useModalState, useAsync, useFormState)
✅ Utility formatters cho tiền, ngày giờ, số điện thoại
✅ Query helper layer cho Supabase
✅ Type definitions tập trung
✅ Cải thiện loading UI
✅ Hỗ trợ provider role
✅ Tài liệu hóa chi tiết cho developer
  