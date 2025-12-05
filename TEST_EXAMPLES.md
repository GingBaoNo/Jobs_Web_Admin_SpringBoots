# API Test Examples

## Example Response: Get Company with Jobs

**Request**: `GET /api/v1/companies/1/jobs`

**Response**:
```json
{
  "success": true,
  "data": {
    "company": {
      "maCongTy": 1,
      "tenCongTy": "Tech Solutions Inc.",
      "tenNguoiDaiDien": "John Doe",
      "maSoThue": "123456789",
      "diaChi": "123 Main St, City",
      "lienHeCty": "contact@techsolutions.com",
      "hinhAnhCty": "/uploads/companies/logo_1.jpg",
      "daXacThuc": true,
      "trangThai": "APPROVED",
      "ngayTao": "2023-01-15T10:30:00"
    },
    "jobs": [
      {
        "maCongViec": 1,
        "tieuDe": "Senior Java Developer",
        "luong": 15000000,
        "loaiLuong": "MONTHLY",
        "gioBatDau": "09:00:00",
        "gioKetThuc": "18:00:00",
        "coTheThuongLuongGio": "YES",
        "gioiTinhYeuCau": "ANY",
        "soLuongTuyen": 2,
        "ngayLamViec": "Monday-Friday",
        "thoiHanLamViec": "Full-time",
        "coTheThuongLuongNgay": "NO",
        "chiTiet": "We are looking for an experienced Java developer...",
        "ngayKetThucTuyenDung": "2023-12-31",
        "ngayDang": "2023-01-10T09:00:00",
        "luotXem": 150,
        "trangThaiDuyet": "Đã duyệt",
        "trangThaiTinTuyen": "Mở",
        "workField": {
          "maLinhVuc": 1,
          "tenLinhVuc": "Information Technology"
        },
        "workType": {
          "maHinhThuc": 1,
          "tenHinhThuc": "Full-time"
        }
      }
    ],
    "jobCount": 1
  },
  "message": "Company and its jobs retrieved successfully"
}
```

## Example Response: Search Companies

**Request**: `GET /api/v1/companies/search?keyword=tech`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "maCongTy": 1,
      "tenCongTy": "Tech Solutions Inc.",
      "tenNguoiDaiDien": "John Doe",
      "maSoThue": "123456789",
      "diaChi": "123 Main St, City",
      "lienHeCty": "contact@techsolutions.com",
      "hinhAnhCty": "/uploads/companies/logo_1.jpg",
      "daXacThuc": true,
      "trangThai": "APPROVED",
      "ngayTao": "2023-01-15T10:30:00"
    }
  ],
  "message": "Companies searched successfully"
}
```

## Example Response: Get Verified Companies with Pagination

**Request**: `GET /api/v1/companies/verified/page?page=0&size=5&sortBy=maCongTy`

**Response**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "maCongTy": 1,
        "tenCongTy": "Tech Solutions Inc.",
        "tenNguoiDaiDien": "John Doe",
        "maSoThue": "123456789",
        "diaChi": "123 Main St, City",
        "lienHeCty": "contact@techsolutions.com",
        "hinhAnhCty": "/uploads/companies/logo_1.jpg",
        "daXacThuc": true,
        "trangThai": "APPROVED",
        "ngayTao": "2023-01-15T10:30:00"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false
      },
      "offset": 0,
      "pageNumber": 0,
      "pageSize": 5,
      "unpaged": false
    },
    "totalElements": 15,
    "totalPages": 3,
    "last": true,
    "first": true,
    "number": 0,
    "size": 5,
    "numberOfElements": 1,
    "empty": false
  },
  "message": "Verified companies retrieved successfully with pagination"
}
```