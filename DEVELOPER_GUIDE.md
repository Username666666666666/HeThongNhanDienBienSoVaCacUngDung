# DEVELOPER GUIDE

## Custom Hooks

### useModalState
Quản lý trạng thái modal một cách sạch sẽ.

```typescript
import { useModalState } from '@/app/hooks';

export const MyComponent = () => {
  const modal = useModalState();

  return (
    <>
      <button onClick={() => modal.open()}>Mở Modal</button>
      
      {modal.isOpen && (
        <div className="modal">
          <button onClick={modal.close}>Đóng</button>
        </div>
      )}
    </>
  );
};
```

### useAsync
Handle async operations với loading/error state tự động.

```typescript
import { useAsync } from '@/app/hooks';

export const UserList = () => {
  const { data, loading, error, execute } = useAsync(
    async () => {
      const response = await fetch('/api/users');
      return response.json();
    }
  );

  return (
    <div>
      {loading && <p>Đang tải...</p>}
      {error && <p>Lỗi: {error.message}</p>}
      {data && <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>}
    </div>
  );
};
```

### useFormState
Quản lý form state, validation errors, touched fields.

```typescript
import { useFormState } from '@/app/hooks';

export const LoginForm = () => {
  const form = useFormState(
    { email: '', password: '' },
    async (values) => {
      await loginUser(values);
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        value={form.values.email}
        onChange={(e) => form.setFieldValue('email', e.target.value)}
        onBlur={() => form.setFieldTouched('email')}
      />
      {form.touched.email && form.errors.email && <p>{form.errors.email}</p>}
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
};
```

## Utilities

### Formatters
```typescript
import { formatCurrency, formatDateTime, formatDate, isValidEmail, normalizePhoneNumber } from '@/app/utils';

// Format tiền
formatCurrency(100000); // "100.000 ₫"

// Format ngày giờ
formatDateTime(new Date()); // "02/05/2026 14:30:45"

// Kiểm tra email
isValidEmail('user@example.com'); // true

// Chuẩn hóa số điện thoại
normalizePhoneNumber('84912345678'); // "0912345678"
```

### Query Helper
```typescript
import { fetchRecords, insertRecord, updateRecord } from '@/app/service';

// Fetch dữ liệu
const { data, error } = await fetchRecords('users');

// Insert dữ liệu
const { data: newUser, error } = await insertRecord('users', {
  email: 'user@example.com',
  name: 'Nguyễn Văn A',
});

// Update dữ liệu
const { data: updated, error } = await updateRecord('users', userId, {
  name: 'Trần Văn B',
});
```

## Best Practices

1. **Sử dụng Custom Hooks để tái sử dụng logic**
   - Thay vì lặp lại useState/useEffect, hãy tạo hook tùy chỉnh.

2. **Sử dụng Formatters để format dữ liệu**
   - Duy trì sự nhất quán trong cách hiển thị dữ liệu.

3. **Sử dụng Query Helper thay vì gọi Supabase trực tiếp**
   - Giúp centralize error handling và logging.

4. **Chia nhỏ component thành các phần nhỏ hơn**
   - Mỗi component nên có một trách nhiệm duy nhất (Single Responsibility Principle).

5. **Sử dụng TypeScript types từ utils/types.ts**
   - Đảm bảo type safety trong toàn ứng dụng.

## File Structure
```
src/app/
├── hooks/
│   ├── index.ts           # Re-export tất cả hooks
│   ├── useAsync.ts
│   ├── useFormState.ts
│   ├── useModalState.ts
│   └── ...
├── utils/
│   ├── index.ts           # Re-export utilities
│   ├── formatters.ts      # Các hàm format
│   ├── types.ts           # Kiểu dữ liệu tập trung
│   └── ...
├── service/
│   ├── index.ts           # Re-export services
│   ├── queryHelper.ts     # Wrapper Supabase queries
│   └── ...
└── ...
```
