# Hệ Thống Quản Lý Bãi Xe - React Native

Ứng dụng di động quản lý bãi xe với React Native, dựa trên dự án web gốc.

## Cấu trúc dự án

```
src/app/
├── components/      # Các component UI (Button, Input, Card, etc.)
├── context/         # React Context (Auth)
├── hooks/           # Custom hooks (useFormState, useAsync, etc.)
├── navigation/      # React Navigation setup
├── pages/           # Screen components
├── service/         # Business logic (Supabase, LPR, CardReader)
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
├── constants/       # Constants
└── App.tsx          # Entry point
```

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Features

- ✅ Authentication (Đăng nhập/Đăng ký)
- ✅ Supabase integration
- ✅ License Plate Recognition (LPR)
- ✅ Card Reader Service
- ✅ Responsive UI Components
- ✅ Error Boundary
- ✅ Custom Hooks

## Tiếp theo

- [ ] Thêm các trang chi tiết cho từng role (Owner, Supervisor, Admin)
- [ ] Implement camera integration
- [ ] Implement real-time monitoring
- [ ] Thêm offline support
- [ ] Push notifications
