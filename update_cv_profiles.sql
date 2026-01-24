-- Script cập nhật cơ sở dữ liệu để thêm tính năng hồ sơ/CV đa năng

-- 1. Tạo bảng lưu trữ hồ sơ CV
CREATE TABLE cv_profiles (
    ma_ho_so_cv INT PRIMARY KEY IDENTITY(1,1),
    ma_nguoi_tim_viec INT NOT NULL,
    ten_ho_so NVARCHAR(255) NOT NULL, -- Tên hồ sơ do người dùng đặt
    mo_ta NVARCHAR(MAX),              -- Mô tả ngắn về hồ sơ
    url_anh_dai_dien NVARCHAR(MAX),
    ho_ten NVARCHAR(255) NOT NULL,
    gioi_tinh NVARCHAR(20) NOT NULL,
    ngay_sinh DATE NULL,
    so_dien_thoai NVARCHAR(20) NULL,
    trinh_do_hoc_van NVARCHAR(45) NULL,
    tinh_trang_hoc_van NVARCHAR(20) NULL,
    kinh_nghiem NVARCHAR(MAX),
    tong_nam_kinh_nghiem DECIMAL(4, 2) DEFAULT 0,
    gioi_thieu_ban_than NVARCHAR(MAX),
    url_cv NVARCHAR(MAX),             -- Đường dẫn đến file CV
    cong_khai BIT NOT NULL DEFAULT 0,
    vi_tri_mong_muon NVARCHAR(255) NULL,
    thoi_gian_mong_muon NVARCHAR(255) NULL,
    loai_thoi_gian_lam_viec NVARCHAR(45) NULL,
    hinh_thuc_lam_viec NVARCHAR(255) NULL,
    loai_luong_mong_muon NVARCHAR(50) NULL,
    muc_luong_mong_muon INT NULL,
    ngay_tao DATETIME NULL DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME NULL DEFAULT GETDATE(),
    la_mac_dinh BIT NOT NULL DEFAULT 0, -- Hồ sơ mặc định
    CONSTRAINT fk_cv_profile_employee FOREIGN KEY (ma_nguoi_tim_viec) REFERENCES [user] (ma_nguoi_dung) ON DELETE CASCADE
);

-- 2. Cập nhật bảng applied_jobs để thêm tham chiếu đến hồ sơ CV
-- (Chỉ chạy nếu cột chưa tồn tại)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('applied_jobs') AND name = 'ma_ho_so_cv')
BEGIN
    ALTER TABLE applied_jobs
    ADD ma_ho_so_cv INT NULL;
END

-- Thêm ràng buộc khóa ngoại (chỉ nếu chưa tồn tại)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_applied_jobs_cv_profile')
BEGIN
    ALTER TABLE applied_jobs
    ADD CONSTRAINT fk_applied_jobs_cv_profile
    FOREIGN KEY (ma_ho_so_cv) REFERENCES cv_profiles (ma_ho_so_cv) ON DELETE NO ACTION;
END

-- 3. Di chuyển dữ liệu từ profile chính sang hồ sơ CV đầu tiên nếu cần
-- (Chỉ chạy nếu bạn muốn chuyển dữ liệu từ profile hiện tại sang hồ sơ CV mới)
/*
INSERT INTO cv_profiles (
    ma_nguoi_tim_viec,
    ten_ho_so,
    url_anh_dai_dien,
    ho_ten,
    gioi_tinh,
    ngay_sinh,
    so_dien_thoai,
    trinh_do_hoc_van,
    tinh_trang_hoc_van,
    kinh_nghiem,
    tong_nam_kinh_nghiem,
    gioi_thieu_ban_than,
    url_cv,
    cong_khai,
    vi_tri_mong_muon,
    thoi_gian_mong_muon,
    loai_thoi_gian_lam_viec,
    hinh_thuc_lam_viec,
    loai_luong_mong_muon,
    muc_luong_mong_muon,
    la_mac_dinh
)
SELECT 
    p.ma_nguoi_tim_viec,
    N'Hồ sơ mặc định',
    p.url_anh_dai_dien,
    p.ho_ten,
    p.gioi_tinh,
    p.ngay_sinh,
    p.so_dien_thoai,
    p.trinh_do_hoc_van,
    p.tinh_trang_hoc_van,
    p.kinh_nghiem,
    p.tong_nam_kinh_nghiem,
    p.gioi_thieu_ban_than,
    p.url_cv,
    p.cong_khai,
    p.vi_tri_mong_muon,
    p.thoi_gian_mong_muon,
    p.loai_thoi_gian_lam_viec,
    p.hinh_thuc_lam_viec,
    p.loai_luong_mong_muon,
    p.muc_luong_mong_muon,
    1 -- Đặt làm hồ sơ mặc định
FROM profile p
LEFT JOIN cv_profiles cp ON p.ma_nguoi_tim_viec = cp.ma_nguoi_tim_viec
WHERE cp.ma_ho_so_cv IS NULL;
*/