# React Native Project - Architecture & Next Steps

## Hiện tại đã hoàn thành

### ✅ Infrastructure (100%)
- Expo configuration (app.json)
- Babel & Tailwind setup
- React Navigation structure (Auth & App stacks)
- Context API (AuthProvider)
- Service layer (queryHelper)
- Custom hooks (useAuth, useAsync, useFormState, useModalState, usePermissions)
- Utility functions (formatters, navigation helpers)
- TypeScript types

### ✅ Core Screens (30%)
- LoginScreen - Đầy đủ chức năng
- DashboardScreen - Scaffold với role checks
- SharedScreens (Profile, Community) - Placeholder

### ✅ Components (20%)
- Common UI components (Button, Input, Card, Loading, ErrorText)
- Basic styling

### ✅ Documentation
- README.md - Setup instructions
- This guide

---

## Phần cần phát triển tiếp (Priority)

### Phase 1: Owner Role Screens (High Priority)
**Tính năng:** 12 screens dành cho chủ xe

```
Owner Screens (src/screens/owner/):
├── OwnerDashboard.tsx          - Main dashboard
├── BrowseParkingLots.tsx       - Danh sách bãi đỗ
├── ParkingLotDetails.tsx       - Chi tiết bãi đỗ
├── RegisterVehicle.tsx         - Đăng ký phương tiện
├── VehicleStatus.tsx           - Trạng thái phương tiện
├── ParkingHistory.tsx          - Lịch sử đỗ xe
├── Transactions.tsx            - Lịch sử giao dịch
├── TopUpCoins.tsx              - Nạp xu ảo
├── VehicleManagement.tsx       - Quản lý phương tiện
└── Settings.tsx                - Cài đặt
```

**Dependencies:**
- Parking lot service (queryHelper wrapped)
- Vehicle service
- Transaction service
- Location service (expo-location)

### Phase 2: Enhanced UI Components
**Cần tạo:**
- TabView (role-based tabs)
- List (FlatList wrapper)
- Modal (Dialog wrapper)
- DatePicker
- MapView (react-native-maps)
- Search component
- Filter component

### Phase 3: Other Role Screens
```
Admin Screens:
- AdminDashboard
- ParkingLotManagement
- UserManagement
- ReportAnalytics

Supervisor Screens:
- GateManagement
- VehicleCheckIn/CheckOut
- ReportList

Support Screens:
- TicketList
- ChatSupport

Provider Screens:
- ServicesList
- OrderManagement
```

### Phase 4: Advanced Features
- Real-time notifications (Supabase Realtime)
- Offline support (AsyncStorage)
- Camera integration (license plate recognition)
- Location tracking
- Push notifications

---

## Architecture Principles

### 1. Component Organization
```
screens/          - Full-page components (navigation destinations)
components/       - Reusable UI components
```

### 2. Service Layer Pattern
```typescript
// src/services/vehicleService.ts
export const getVehicles = async (userId: string) => {
  return fetchRecords('vehicles', { owner_id: userId });
};

export const registerVehicle = async (data: Vehicle) => {
  return insertRecord('vehicles', data);
};
```

### 3. Hook Pattern
```typescript
// src/hooks/useVehicles.ts
export const useVehicles = () => {
  const { data, loading, error, execute } = useAsync(
    () => getVehicles(user.id)
  );
  return { vehicles: data, loading, error, refresh: execute };
};
```

### 4. Screen Implementation Pattern
```typescript
export const OwnerScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { vehicles, loading, refresh } = useVehicles();
  
  return (
    <ScrollView>
      {loading ? <Loading /> : (
        <FlatList
          data={vehicles}
          renderItem={({ item }) => <VehicleCard item={item} />}
          keyExtractor={(item) => item.id}
          onEndReached={refresh}
        />
      )}
    </ScrollView>
  );
};
```

---

## Database Schema (from Supabase)

### Users Table
```
- manguoidung (id)
- tennguoidung (name)
- email
- chucnang (role)
```

### Vehicles Table
```
- id
- owner_id
- plate_number
- vehicle_type
- status
- parking_lot_id
- entry_time
```

### Parking Lots Table
```
- id
- name
- address
- admin_id
- total_spots
- occupied_spots
- rating
```

### Parking Sessions Table
```
- id
- vehicle_id
- parking_lot_id
- entry_time
- exit_time
- amount
- status
```

---

## Testing Strategy

### Unit Tests
```bash
npm test
```

### Component Testing
Use React Native Testing Library

### E2E Testing
Use Detox or similar

---

## Performance Considerations

1. **Lazy Loading**: Implement pagination for lists
2. **Memoization**: Use useMemo/useCallback for expensive operations
3. **Image Optimization**: Compress images, use lazy loading
4. **Bundle Size**: Monitor with `react-native-bundle-analyzer`

---

## Common Patterns to Implement

### 1. List with Pagination
```typescript
const useInfiniteList = (queryFn) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    const newItems = await queryFn(page);
    setItems(prev => [...prev, ...newItems]);
    setPage(p => p + 1);
  }, [page, queryFn]);

  return { items, loadMore, hasMore };
};
```

### 2. Pull-to-Refresh
```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await refresh();
  setRefreshing(false);
}, [refresh]);

<FlatList
  onRefresh={onRefresh}
  refreshing={refreshing}
/>
```

### 3. Search with Debounce
```typescript
const useSearch = (queryFn) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        queryFn(query).then(setResults);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, queryFn]);

  return { query, setQuery, results };
};
```

---

## Next Immediate Steps

1. **Create owner services** (src/services/ownerService.ts)
2. **Create owner hooks** (src/hooks/useVehicles.ts, useParking.ts)
3. **Implement owner screens** (following the 12 screens list)
4. **Add navigation stack** for owner role
5. **Test authentication flow** on device/emulator

---

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

---

## Contact & Support

For issues or questions, refer to:
- Web version documentation
- Supabase documentation
- React Native/Expo communities
