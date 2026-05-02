# Hệ thống bãi đỗ xe - React Native Edition

Phiên bản React Native của hệ thống quản lý bãi đỗ xe thông minh.

## Cài đặt

### Yêu cầu
- Node.js >= 18
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)

### Bước 1: Cài đặt phụ thuộc
```bash
npm install
# hoặc
yarn install
```

### Bước 2: Setup Supabase
Cập nhật `app.json` với Supabase URL và API key của bạn:

```json
"extra": {
  "supabaseUrl": "your-supabase-url",
  "supabaseAnonKey": "your-supabase-key"
}
```

### Bước 3: Chạy ứng dụng

**Trên iOS:**
```bash
npm run ios
```

**Trên Android:**
```bash
npm run android
```

**Trên Web (dev):**
```bash
npm run web
```

**Chế độ phát triển:**
```bash
npm start
```

## Cấu trúc thư mục

```
src/
├── components/          # UI components tái sử dụng
├── screens/            # Màn hình chính (Login, Dashboard, etc.)
├── navigation/         # React Navigation setup
├── hooks/              # Custom hooks (useAuth, useAsync, etc.)
├── services/           # Supabase queries wrapper
├── utils/              # Utility functions (formatters, validators)
├── context/            # React Context (AuthContext)
├── constants/          # Constants (roles, routes, messages)
├── types/              # TypeScript type definitions
└── index.ts            # Main exports
```

## Các tính năng chính

### ✅ Hoàn thành
- Authentication (Login/Register)
- Role-based routing (Owner, Admin, Supervisor, Support, Provider)
- Custom hooks (useAsync, useFormState, useModalState)
- Supabase integration
- Error handling

### 🔄 Cần phát triển
- Owner screens (Browse parking lots, register vehicle)
- Admin screens (Dashboard, management)
- Supervisor screens (Gate management)
- Community features
- Profile management
- NativeWind styling

## Custom Hooks

### useAuth()
Quản lý authentication:
```typescript
const { user, loading, login, logout } = useAuth();
```

### useAsync()
Handle async operations:
```typescript
const { data, loading, error, execute } = useAsync(
  async () => fetch('/api/data')
);
```

### useFormState()
Quản lý form state:
```typescript
const form = useFormState(
  { email: '', password: '' },
  async (values) => { /* submit */ }
);
```

### useModalState()
Quản lý modal:
```typescript
const modal = useModalState();
modal.open();
modal.close();
```

### usePermissions()
Kiểm tra quyền:
```typescript
const { isAdmin, isSupervisor, isOwner } = usePermissions();
```

## Styles

Dự án sử dụng **NativeWind** (Tailwind cho React Native).

Ví dụ:
```typescript
<View className="flex-1 bg-gray-100 p-4">
  <Text className="text-2xl font-bold text-blue-600">Title</Text>
</View>
```

## Services

### QueryHelper
Wrapper cho Supabase queries:
```typescript
import { fetchRecords, insertRecord } from '@/services';

const { data, error } = await fetchRecords('users');
const { data: newUser, error } = await insertRecord('users', userData);
```

## Environment Variables

Tạo file `.env`:
```
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
```

## Troubleshooting

### Error: "Cannot find module"
Chạy:
```bash
npm install
```

### Error: "Supabase connection failed"
Kiểm tra:
- URL và API key trong `app.json` hoặc `.env`
- Kết nối internet
- Firewall settings

### Error: "Build failed"
Thử:
```bash
npm run start -- -c
```

## Phát triển thêm

Để thêm màn hình mới:

1. Tạo file screen mới trong `src/screens/`
2. Đăng ký trong `src/navigation/RootNavigator.tsx`
3. Sử dụng custom hooks và components

## Deployment

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Tài liệu thêm
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [Supabase](https://supabase.com/docs)
