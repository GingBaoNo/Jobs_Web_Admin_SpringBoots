Báo cáo: Các bảng chưa được sử dụng trong dự án và gợi ý xây dựng chức năng

  1. Tổng quan

  Dự án hiện tại có một số bảng trong cơ sở dữ liệu chưa được sử dụng hoàn toàn trong mã nguồn. Việc tận dụng các
  bảng này sẽ giúp mở rộng chức năng và cải thiện trải nghiệm người dùng.

  2. Các bảng chưa được sử dụng hoàn toàn

  2.1. Bảng job_alerts (Thông báo việc làm)

  Cấu trúc bảng:
   - ma_thong_bao_viec_lam: ID chính
   - ma_nguoi_dung: Người dùng tạo thông báo
   - tieu_de: Tiêu đề thông báo
   - tu_khoa: Từ khóa tìm kiếm
   - ma_linh_vuc: Lĩnh vực
   - ma_hinh_thuc: Hình thức làm việc
   - tinh_thanh_pho: Tỉnh/Thành phố
   - vi_tri_cong_viec: Vị trí công việc
   - kinh_nghiem_lam_viec: Kinh nghiệm làm việc
   - gioi_tinh: Giới tính
   - thoi_gian_tao: Thời gian tạo
   - trang_thai: Trạng thái

  Hiện trạng:
   - Chưa có entity, repository, service, controller nào được tạo

  Gợi ý xây dựng chức năng:
   - Tạo chức năng "Theo dõi việc làm" cho người tìm việc
   - Người dùng có thể tạo các bộ lọc yêu thích và nhận thông báo khi có việc làm mới phù hợp
   - Tích hợp với hệ thống email để gửi thông báo định kỳ
   - Cho phép người dùng quản lý các thông báo đã tạo
   - Tự động gửi email hoặc thông báo trong ứng dụng khi có việc làm mới phù hợp

  2.2. Bảng company_followers (Người theo dõi công ty)

  Cấu trúc bảng:
   - ma_theo_doi: ID chính
   - ma_nguoi_dung: Người theo dõi
   - ma_cong_ty: Công ty được theo dõi
   - ngay_theo_doi: Ngày theo dõi

  Hiện trạng:
   - Chưa có entity, repository, service, controller nào được tạo

  Gợi ý xây dựng chức năng:
   - Tạo chức năng "Theo dõi công ty" cho người tìm việc
   - Người dùng có thể theo dõi các công ty yêu thích để nhận cập nhật việc làm mới
   - Hiển thị danh sách công ty đang theo dõi trong hồ sơ người dùng
   - Gửi thông báo khi công ty có việc làm mới
   - Hiển thị số lượng người theo dõi trên trang công ty
   - Tạo trang "Công ty đang theo dõi" trong hồ sơ người dùng

  2.3. Bảng locations (Địa điểm)

  Cấu trúc bảng:
   - ma_dia_diem: ID chính
   - ma_cha: ID cha (để tạo cấu trúc phân cấp tỉnh/thành phố - quận/huyện)
   - ten_dia_diem: Tên địa điểm
   - cap_do: Cấp độ (Tỉnh/Thành phố hoặc Quận/Huyện)
   - kinh_do, vi_do: Tọa độ

  Hiện trạng:
   - Entity Location.java đã được tạo
   - Repository LocationRepository.java đã được tạo
   - Service LocationService.java đã được tạo
   - Chưa có controller nào sử dụng bảng này một cách đầy đủ

  Gợi ý xây dựng chức năng:
   - Tạo API controller cho Location
   - Thay thế danh sách tỉnh thành hiện tại bằng dữ liệu từ bảng locations
   - Cho phép chọn cả cấp tỉnh và cấp huyện trong tìm kiếm
   - Tích hợp với hệ thống OpenStreetMap để lấy tọa độ
   - Hỗ trợ cấu trúc phân cấp tỉnh - huyện
   - Cung cấp hệ thống địa điểm chính xác và đầy đủ hơn

  2.4. Bảng job_locations (Liên kết công việc - địa điểm)

  Cấu trúc bảng:
   - ma_jblc: ID chính
   - ma_cong_viec: ID công việc
   - ma_dia_diem: ID địa điểm
   - Tạo mối quan hệ nhiều-nhiều giữa công việc và địa điểm

  Hiện trạng:
   - Entity JobLocation.java đã được tạo
   - Repository JobLocationRepository.java đã được tạo
   - Service JobLocationService.java đã được tạo
   - Chưa có controller nào sử dụng bảng này một cách đầy đủ

  Gợi ý xây dựng chức năng:
   - Tạo API controller cho JobLocation
   - Cho phép một công việc có nhiều địa điểm làm việc
   - Cập nhật phương thức tạo/chỉnh sửa công việc để xử lý danh sách địa điểm
   - Cập nhật phương thức convertJobDetailToMap trong ApiJobDetailController để bao gồm thông tin địa điểm
   - Cho phép tìm kiếm việc làm theo nhiều địa điểm
   - Hỗ trợ tìm kiếm việc làm theo địa điểm chính xác hơn

  3. Lợi ích khi triển khai các bảng chưa sử dụng

  3.1. Lợi ích chung:
   - Tăng trải nghiệm người dùng bằng cách cung cấp nhiều tính năng hơn
   - Tăng sự tương tác và giữ chân người dùng
   - Cải thiện khả năng tìm kiếm và lọc việc làm
   - Tạo hệ sinh thái khép kín cho hệ thống tìm kiếm việc làm

  3.2. Lợi ích cụ thể:

  Cho `job_alerts`:
   - Giữ chân người dùng bằng cách gửi thông tin cập nhật
   - Tăng khả năng tìm được việc làm phù hợp
   - Tạo trải nghiệm cá nhân hóa

  Cho `company_followers`:
   - Tạo cộng đồng giữa người tìm việc và công ty
   - Tăng tương tác và khả năng nhận được ứng viên tiềm năng cho công ty
   - Tạo nguồn thông tin cập nhật về công ty yêu thích cho người tìm việc

  Cho `locations`:
   - Cung cấp hệ thống địa điểm chính xác và đầy đủ hơn
   - Hỗ trợ cấu trúc phân cấp tỉnh - huyện
   - Tích hợp với hệ thống OpenStreetMap để lấy tọa độ

  Cho `job_locations`:
   - Cho phép một công việc có nhiều địa điểm làm việc
   - Tăng tính linh hoạt cho các công ty có nhiều chi nhánh
   - Hỗ trợ tìm kiếm việc làm theo địa điểm chính xác hơn

  4. Kế hoạch triển khai đề xuất

  Giai đoạn 1: Triển khai locations và job_locations
   - Tạo controller cho Location và JobLocation
   - Cập nhật giao diện tìm kiếm để sử dụng địa điểm từ bảng mới
   - Cập nhật phương thức trả về API để bao gồm thông tin địa điểm

  Giai đoạn 2: Triển khai job_alerts
   - Tạo entity, repository, service, controller cho JobAlert
   - Tích hợp vào giao diện tìm kiếm với nút "Lưu tìm kiếm"
   - Tạo trang quản lý thông báo việc làm

  Giai đoạn 3: Triển khai company_followers
   - Tạo entity, repository, service, controller cho CompanyFollower
   - Thêm nút "Theo dõi" trên trang công ty
   - Tạo trang "Công ty đang theo dõi" trong hồ sơ người dùng

  5. Kết luận

  Việc tận dụng các bảng chưa được sử dụng sẽ giúp dự án trở nên hoàn chỉnh và chuyên nghiệp hơn. Các tính năng
  này không chỉ cải thiện trải nghiệm người dùng mà còn tăng tính cạnh tranh cho hệ thống tìm kiếm việc làm. Nên
  ưu tiên triển khai các bảng locations và job_locations trước vì chúng liên quan trực tiếp đến chức năng cốt lõi
  của hệ thống.
