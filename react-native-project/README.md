# HeThongNhanDienBienSoVaCacUngDung - React Native

Bản React Native của hệ thống nhận diện biển số và các ứng dụng bãi xe.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cài đặt iOS dependencies (chỉ trên macOS):
```bash
cd ios && pod install && cd ..
```

## Chạy ứng dụng

### Android
```bash
npm run android
```

### iOS (chỉ trên macOS)
```bash
npm run ios
```

### Development server
```bash
npm start
```

## Cấu trúc dự án

```
src/
├── app/
│   ├── components/     # UI components
│   ├── context/        # React contexts (Auth, etc.)
│   ├── navigation/     # Navigation setup
│   ├── screens/        # Screen components
│   │   ├── auth/       # Authentication screens
│   │   └── ...         # Other screens
│   ├── service/        # API services
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── assets/             # Images, fonts, etc.
└── ...
```

## Tính năng

- ✅ Authentication với Supabase
- ✅ TypeScript strict mode
- ✅ Input validation
- ✅ Navigation với React Navigation
- 🔄 Đang phát triển: Core features

## Công nghệ sử dụng

- React Native 0.72.6
- TypeScript
- React Navigation
- Supabase
- AsyncStorage

## Phát triển tiếp

Dự án này đang trong quá trình chuyển đổi từ React Web sang React Native. Các tính năng chính sẽ được implement dần.