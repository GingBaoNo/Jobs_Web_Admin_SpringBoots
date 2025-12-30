# Hướng Dẫn Chuyển Đổi Sang OpenStreetMap

## 1. Giới Thiệu OpenStreetMap

OpenStreetMap (OSM) là một dự án bản đồ thế giới mã nguồn mở, hoàn toàn miễn phí để sử dụng. Không cần API key, không giới hạn yêu cầu, và dữ liệu được đóng góp bởi cộng đồng.

## 2. Lợi Ích Của OpenStreetMap

- **Miễn phí hoàn toàn**: Không cần API key, không giới hạn yêu cầu
- **Mã nguồn mở**: Dữ liệu được đóng góp bởi cộng đồng
- **Tùy chỉnh cao**: Có thể tùy chỉnh giao diện bản đồ
- **Không phụ thuộc vào nhà cung cấp thương mại**: Không lo bị giới hạn hoặc tính phí
- **Hỗ trợ cộng đồng mạnh mẽ**: Nhiều thư viện và công cụ hỗ trợ

## 3. Thư Viện Sử Dụng

Chúng ta sẽ sử dụng **Leaflet.js** - một thư viện JavaScript mã nguồn mở phổ biến để hiển thị bản đồ từ OpenStreetMap.

## 4. So Sánh Tính Năng

| Tính năng | Google Maps | HERE Maps | OpenStreetMap (Leaflet) |
|-----------|-------------|-----------|------------------------|
| Bản đồ tương tác | Có | Có | Có |
| Geocoding | Có (trả phí) | Có (trả phí) | Có (thông qua Nominatim - miễn phí) |
| Reverse Geocoding | Có (trả phí) | Có (trả phí) | Có (thông qua Nominatim - miễn phí) |
| Marker | Có | Có | Có |
| Phí cơ bản | Miễn phí (với giới hạn) | Miễn phí (với giới hạn) | Hoàn toàn miễn phí |
| Tùy chỉnh giao diện | Có | Có | Rất cao |
| API JavaScript | Có | Có | Có |

## 5. Các Bước Cập Nhật Trong Ứng Dụng

1. Thay thế thư viện Google Maps và HERE Maps bằng Leaflet.js
2. Cập nhật các hàm JavaScript để sử dụng API của OpenStreetMap
3. Cập nhật giao diện người dùng để tương thích với Leaflet
4. Kiểm tra lại toàn bộ tính năng bản đồ