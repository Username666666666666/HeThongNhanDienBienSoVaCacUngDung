# Supabase Optimization Guide

## Mục đích
Tập trung vào tối ưu hóa database Supabase cho các truy vấn thường dùng trong dự án:
- truy vấn theo `manguoidung`, `mabaido`, `mabangcongdong`
- truy vấn theo `maxevao`, `maxera`, `bienso`, `makhuvuc`
- các bảng liên quan đến community và parking flow

## File index
Sử dụng file `supabase/sql/indexes.sql` để tạo index trong Supabase SQL Editor hoặc bằng tool CLI.

## Cách áp dụng
1. Mở Supabase Dashboard.
2. Vào Database > SQL Editor.
3. Dán nội dung `supabase/sql/indexes.sql` và chạy.

## Query optimization
- Chỉ `select` những cột cần thiết, tránh `select('*')` khi không cần toàn bộ dữ liệu.
- Với `.in()` và tập giá trị lớn, cân nhắc sử dụng table tạm hoặc stored procedure nếu mảng lớn.
- Dùng composite index cho các truy vấn kết hợp nhiều điều kiện.

## Index nên tạo
- `lichsuxevao(bienso, ketthuc, mavitri)`
- `lichsuxera(maxevao)`
- `thanhtoan(maxera)`
- `baicongdong(mabaido, is_deleted, phanloai)`
- `yeu_cau_dat_lai_pin(email, da_su_dung)`

## Lưu ý
Nếu tên bảng/column khác với schema thực tế của database, bạn cần điều chỉnh tương ứng.
