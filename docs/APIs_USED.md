# API Documentation - Sehat Saathi

**APIs created and used within the project with endpoint descriptions, request/response formats, authentication methods, and example use cases.**

---

## APIs Created

### Authentication APIs

#### POST `/api/auth/register`
**Description**: Register new field representatives  
**Request**: `{ "nationalId": "123456789", "password": "password123", "name": "John Doe" }`  
**Response**: `{ "message": "Representative registered successfully", "token": "jwt_token" }`  
**Use Case**: Create new field representative account

#### POST `/api/auth/login/representative`
**Description**: Field representative login  
**Request**: `{ "nationalId": "123456789", "password": "password123" }`  
**Response**: `{ "token": "jwt_token", "user": {...} }`  
**Use Case**: Field rep authentication for data collection

#### POST `/api/auth/login/admin`
**Description**: Admin login  
**Request**: `{ "nationalId": "ADMIN001", "password": "admin123" }`  
**Response**: `{ "token": "jwt_token", "user": {...} }`  
**Use Case**: Admin authentication for dashboard access

### Child Records APIs

#### POST `/api/children/batch`
**Description**: Upload multiple child records  
**Authentication**: Field representative JWT token  
**Request**: `{ "records": [{"name": "Child", "age": 5, "weight": 18}] }`  
**Response**: `{ "message": "Records uploaded successfully", "count": 3 }`  
**Use Case**: Sync offline collected data to server

#### GET `/api/children`
**Description**: Get all child records (admin only)  
**Authentication**: Admin JWT token  
**Response**: `{ "children": [...], "totalCount": 150 }`  
**Use Case**: Admin views all collected records

#### GET `/api/children/stats`
**Description**: Get system statistics (admin only)  
**Authentication**: Admin JWT token  
**Response**: `{ "totalChildren": 150, "representativesActive": 5 }`  
**Use Case**: Dashboard analytics for admins

### Sync APIs

#### POST `/api/sync/upload`
**Description**: Alternative sync endpoint  
**Request**: `{ "data": [...], "timestamp": "2024-01-01T10:00:00Z" }`  
**Response**: `{ "success": true, "syncedCount": 5 }`  
**Use Case**: Background data synchronization

---

## APIs Used

### MOSIP eSignet API (Framework Ready)
**Description**: Digital identity authentication (development mode with mocks)  
**Base URL**: `https://esignet.dev.mosip.net` (production)  
**Current**: Mock implementation for development  
**Use Case**: Future integration for Aadhaar-based parent authentication

### Browser APIs
- **File API**: Photo uploads with `<input type="file" accept="image/*">`
- **IndexedDB API**: Offline data storage for PWA
- **Geolocation API**: GPS coordinates capture  
- **Service Worker API**: Background sync and caching
- **localStorage API**: JWT token storage

**Use Case**: Offline-first functionality - store data locally when no internet, sync when online

---

## Authentication Method
**Type**: JWT Bearer Token  
**Header**: `Authorization: Bearer <token>`  
**Roles**: field_representative, admin  
**Storage**: localStorage (frontend)

---

*Simple and accurate documentation for Sehat Saathi project APIs.*