-- Supabase database optimization: index creation for frequently filtered columns.
-- Chạy file này trong Supabase SQL Editor hoặc qua psql với quyền phù hợp.

CREATE INDEX IF NOT EXISTS idx_lichsuxevao_bienso_ketthuc_mavitri
  ON lichsuxevao (bienso, ketthuc, mavitri);

CREATE INDEX IF NOT EXISTS idx_lichsuxevao_ketthuc
  ON lichsuxevao (ketthuc);

CREATE INDEX IF NOT EXISTS idx_lichsuxera_maxevao
  ON lichsuxera (maxevao);

CREATE INDEX IF NOT EXISTS idx_thanhtoan_maxera
  ON thanhtoan (maxera);

CREATE INDEX IF NOT EXISTS idx_khuvudo_mabaido
  ON khuvudo (mabaido);

CREATE INDEX IF NOT EXISTS idx_vitrido_makhuvuc
  ON vitrido (makhuvuc);

CREATE INDEX IF NOT EXISTS idx_ctnhanvien_manguoidung
  ON ctnhanvien (manguoidung);

CREATE INDEX IF NOT EXISTS idx_ctchuxe_manguoidung
  ON ctchuxe (manguoidung);

CREATE INDEX IF NOT EXISTS idx_ctadmin_manguoidung
  ON ctadmin (manguoidung);

CREATE INDEX IF NOT EXISTS idx_ctnhacungcap_manguoidung
  ON ctnhacungcap (manguoidung);

CREATE INDEX IF NOT EXISTS idx_baicongdong_mabangcongdong
  ON baicongdong (mabangcongdong);

CREATE INDEX IF NOT EXISTS idx_hinhanh_mabangcongdong
  ON hinhanh (mabangcongdong);

CREATE INDEX IF NOT EXISTS idx_hinhanh_binhluan_mactbaicongdong
  ON hinhanh_binhluan (mactbaicongdong);

CREATE INDEX IF NOT EXISTS idx_camxuc_baidang_mabangcongdong
  ON camxuc_baidang (mabangcongdong);

CREATE INDEX IF NOT EXISTS idx_ct_baicongdong_camxuc_mactbaicongdong
  ON ct_baicongdong_camxuc (mactbaicongdong);

CREATE INDEX IF NOT EXISTS idx_kichthuoccamxuc_ct_camxuc_id
  ON kichthuoccamxuc (ct_camxuc_id);

CREATE INDEX IF NOT EXISTS idx_thanhvienhopthoai_mabangcongdong
  ON thanhvienhopthoai (mabangcongdong);

CREATE INDEX IF NOT EXISTS idx_thanhvienhopthoai_manguoidung
  ON thanhvienhopthoai (manguoidung);

CREATE INDEX IF NOT EXISTS idx_yeu_cau_dat_lai_pin_email_da_su_dung
  ON yeu_cau_dat_lai_pin (email, da_su_dung);

CREATE INDEX IF NOT EXISTS idx_community_mathamgia
  ON baido (mathamgia);

CREATE INDEX IF NOT EXISTS idx_support_posts_mabaido_is_deleted_phanloai
  ON baicongdong (mabaido, is_deleted, phanloai);

CREATE INDEX IF NOT EXISTS idx_user_email
  ON nguoidung (email);

-- Lưu ý: Supabase tự động tạo index cho primary key.
-- Kiểm tra lại tên bảng/column nếu schema khác với tên đã dùng ở dự án.
