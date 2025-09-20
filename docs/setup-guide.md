# Child Health Record Application - Setup Guide

## Overview
A complete PWA application for offline child health data collection with secure upload via eSignet authentication.

## Current Status ✅
- ✅ React Frontend (Vite + Tailwind CSS)
- ✅ Node.js Backend (Express + MongoDB)
- ✅ Basic UI Components
- ✅ API Endpoints
- ✅ Database Models

## Quick Start

### Prerequisites
- Node.js 20.18+ (latest LTS recommended)
- MongoDB (optional for development)
- Git

### 1. Frontend Setup
```bash
cd child-health-app
npm install
npm run dev
```
**Frontend URL:** http://localhost:5173

### 2. Backend Setup
```bash
cd child-health-backend
npm install
npm run dev
```
**Backend URL:** http://localhost:5000

## Features Implemented

### Frontend (React PWA)
- 📱 Responsive design with Tailwind CSS
- 🧭 Navigation with online/offline status
- 📊 Dashboard with statistics
- 📝 Child data collection form with photo upload
- 📋 Records list with filtering
- 🔄 Sync page with mock eSignet authentication
- 💾 Local storage for offline functionality

### Backend (Node.js API)
- 🚀 Express server with security middleware
- 🔐 Mock eSignet authentication endpoints
- 📂 Child record CRUD operations
- 🔄 Bulk data upload/sync endpoints
- 🗄️ MongoDB integration with schemas
- 📋 Health record PDF generation endpoint (mock)

### Database (MongoDB)
- 👶 ChildRecord model with comprehensive fields
- 👨‍⚕️ Representative model for field agents
- 📊 BMI calculation virtual field
- 🔍 Search indexes for optimization

## API Endpoints

### Children Records
- `GET /api/children` - Get all records
- `POST /api/children` - Create new record
- `GET /api/children/:healthId` - Get record by Health ID
- `GET /api/children/:healthId/booklet` - Generate PDF booklet

### Authentication
- `POST /api/auth/esignet` - eSignet authentication
- `POST /api/auth/send-otp` - Send OTP

### Sync
- `POST /api/sync/upload` - Upload multiple records
- `GET /api/sync/status` - Check sync status

## Testing the Application

### 1. Test Frontend
1. Open http://localhost:5173
2. Navigate through different pages
3. Try adding a child record (stores locally)
4. Check offline/online status indicator

### 2. Test Backend
1. Open http://localhost:5000 (API info)
2. Test endpoints with browser/Postman:
   - GET http://localhost:5000/api/children
   - GET http://localhost:5000/health

### 3. Test Authentication
Use OTP: `123456` for mock authentication testing

## Development Notes

### Current Mock Features
- eSignet authentication (accepts any National ID + OTP: 123456)
- Child records (stored in memory/localStorage)
- PDF generation (returns mock response)

### Next Steps
1. 🔄 Add real IndexedDB for offline storage
2. 🔗 Connect frontend to backend APIs  
3. 📄 Implement actual PDF generation
4. 🔐 Integrate real eSignet endpoints
5. 📱 Add PWA manifest and service worker

## Environment Variables
```bash
# Backend (.env)
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/child-health-db
JWT_SECRET=your-super-secret-key
```

## Troubleshooting

### Node.js Version Warning
- Current: 20.18.0
- Required: 20.19+ or 22.12+
- App runs with warnings but works fine

### MongoDB Connection
- App continues without MongoDB in development
- Install MongoDB for full database features

### Port Conflicts
- Frontend: 5173 (configurable in vite.config.js)
- Backend: 5000 (configurable in .env)

## Project Structure
```
child-health-record/
├── child-health-app/          # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   └── ...
├── child-health-backend/      # Node.js Backend  
│   ├── config/               # Database config
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   └── server.js             # Main server file
└── docs/                     # Documentation
```

---

**Status:** ✅ Basic runnable application complete with frequent git commits
**Next:** Add PWA features, real authentication, and production deployment