# API Documentation for Company Data

This document describes the API endpoints available for the Android app to fetch company data.

## Base URL
`http://localhost:8080/api/v1/companies`

## Endpoints

### 1. Get All Companies
- **URL**: `GET /api/v1/companies`
- **Description**: Retrieve all companies
- **Response**: Array of company objects

### 2. Get Verified Companies Only
- **URL**: `GET /api/v1/companies/verified`
- **Description**: Retrieve only verified companies (daXacThuc = true)
- **Response**: Array of verified company objects

### 3. Search Companies
- **URL**: `GET /api/v1/companies/search?keyword={keyword}`
- **Description**: Search companies by name
- **Parameters**: 
  - `keyword` (required): Search term for company name
- **Response**: Array of matching company objects

### 4. Get Companies with Pagination
- **URL**: `GET /api/v1/companies/page?page={page}&size={size}&sortBy={sortBy}`
- **Description**: Retrieve companies with pagination
- **Parameters**:
  - `page` (optional, default=0): Page number (0-indexed)
  - `size` (optional, default=10): Number of items per page
  - `sortBy` (optional, default=maCongTy): Field to sort by
- **Response**: Paginated company data

### 5. Get Verified Companies with Pagination
- **URL**: `GET /api/v1/companies/verified/page?page={page}&size={size}&sortBy={sortBy}`
- **Description**: Retrieve verified companies with pagination
- **Parameters**:
  - `page` (optional, default=0): Page number (0-indexed)
  - `size` (optional, default=10): Number of items per page
  - `sortBy` (optional, default=maCongTy): Field to sort by
- **Response**: Paginated verified company data

### 6. Get Company by ID
- **URL**: `GET /api/v1/companies/{id}`
- **Description**: Retrieve a specific company by ID
- **Parameters**:
  - `id` (required): Company ID
- **Response**: Single company object

### 7. Get Company with Jobs
- **URL**: `GET /api/v1/companies/{id}/jobs`
- **Description**: Retrieve a company along with its job listings
- **Parameters**:
  - `id` (required): Company ID
- **Response**: Object containing company info and associated job listings

## Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {} // Actual data payload
}
```

For errors:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Company Object Fields

```json
{
  "maCongTy": 1,
  "tenCongTy": "Company Name",
  "tenNguoiDaiDien": "Representative Name",
  "maSoThue": "Tax ID",
  "diaChi": "Address",
  "lienHeCty": "Company Contact",
  "hinhAnhCty": "Company Logo URL",
  "daXacThuc": true,
  "trangThai": "PENDING/APPROVED/REJECTED",
  "ngayTao": "2023-01-01T00:00:00"
}
```

## Error Handling

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (company not found)

## CORS Policy

All endpoints allow cross-origin requests from any origin (`*`) with a maximum age of 3600 seconds.

## Usage for Android App

The APIs are designed to be mobile-friendly. Use the `/verified` endpoints to get only legitimate companies, and use pagination to handle large datasets efficiently.

Example for fetching verified companies:
```
GET http://your-server/api/v1/companies/verified
```

Example for searching companies:
```
GET http://your-server/api/v1/companies/search?keyword=tech
```

Example for getting company with jobs:
```
GET http://your-server/api/v1/companies/1/jobs
```