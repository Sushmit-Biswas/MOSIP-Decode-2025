# Sehat Saathi - Setup Guide

## 🛠️ Prerequisites & Installation

### Required Software
1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Git** - Download from [git-scm.com](https://git-scm.com/)
3. **Code Editor** - VS Code recommended

### Verify Installation
```bash
node --version    # Should show v18+ or v20+
npm --version     # Should show 8+
git --version     # Should show 2+
```

## 🚀 How to Run the Code

### Step 1: Download/Clone Project
```bash
# If you have the zip file, extract it
# Navigate to the correct project folder (use quotes for folder names with spaces)
cd "sehat-saathi-main\MOSIP Decode-2025"
```

### Step 2: Install Dependencies & Start Backend
```bash
# Navigate to backend folder (from MOSIP Decode-2025 directory)
cd child-health-backend

# Install all required packages
npm install

# Create environment file (optional)
echo "JWT_SECRET=your-secret-key" > .env
echo "MONGODB_URI=mongodb://localhost:27017/child-health" >> .env
echo "PORT=5000" >> .env

# Start the backend server
npm start
```
**✅ Backend should now be running on http://localhost:5000**

### Step 3: Install Dependencies & Start Frontend
```bash
# Open new terminal/command prompt
# Navigate to the correct project folder first, then frontend folder
cd "sehat-saathi-main\MOSIP Decode-2025"
cd child-health-app

# Install all required packages
npm install

# Start the development server
npm run dev
```
**✅ Frontend should now be running on http://localhost:5173**

### Step 4: Access the Application
- Open your browser and go to: **http://localhost:5173**
- The application should load successfully
- Both servers must be running for full functionality

---

## 🎯 Overview
Offline-first PWA for child health data collection with MOSIP eSignet authentication.

## ✅ Current Status
- ✅ React 19.1.1 Frontend (Vite + Tailwind CSS + PWA)
- ✅ Node.js Backend (Express 5.1.0 + MongoDB + JWT)
- ✅ PWA with Service Worker and IndexedDB
- ✅ MOSIP eSignet Integration (development-ready)
- ✅ Admin Portal & Analytics Dashboard
- ✅ Mobile-Optimized Design

## 🚀 Quick Start (Summary)

### Prerequisites
- Node.js 18+ (current: 20.18.0 works fine)
- MongoDB (optional - app works with fallback data)
- Modern web browser

### Step 1: Start Backend Server
```bash
cd child-health-backend
npm install
npm start
```
**Backend runs on:** http://localhost:5000

### Step 2: Start Frontend Application
```bash
# Open new terminal
cd child-health-app
npm install
npm run dev
```
**Frontend runs on:** http://localhost:5173

## 🎮 How to Use the Application

### 1. **Main Dashboard** (http://localhost:5173)
- View application overview and statistics
- Quick action buttons for common tasks
- Online/offline status indicator

### 2. **Add Child Record** (/add-child)
- Fill comprehensive child health form
- Upload/capture child photo
- Automatic Health ID generation
- Works offline - data stored locally

### 3. **View Records** (/records)
- Browse all collected records
- Filter by status (uploaded/pending)
- View detailed child information
- BMI calculations and health indicators

### 4. **Data Sync** (/sync)
- **Field Rep Login:**
  - National ID: any ID (e.g., "123456789")  
  - Password: "password123"
- **Admin Login:**
  - National ID: "ADMIN001", "ADMIN123", or "admin"
  - Password: "admin123"
- Upload offline records to server
- Real-time sync status

### 5. **Admin Portal** (/admin)
- View all uploaded data with advanced filtering
- Search by name, Health ID, date
- Export data to CSV
- Download PDF health booklets

### 6. **Analytics Dashboard** (/analytics)
- Visual charts and health trends
- Age distribution analysis
- BMI category breakdown
- Malnutrition monitoring
- Representative performance

## 📱 PWA Features

### Install as Mobile App
1. Open http://localhost:5173 on mobile
2. Look for "Install App" prompt or
3. Browser menu → "Add to Home Screen"
4. App works offline with full functionality

### Test PWA Features
- **Offline Mode**: Disconnect internet, app still works
- **Background Sync**: Data syncs when connection restored
- **Mobile Navigation**: Bottom tab bar on mobile
- **Touch Optimized**: All buttons sized for fingers

## 🔧 API Testing

### Test Authentication (Field Rep)
```bash
curl -X POST http://localhost:5000/api/auth/login/representative \
  -H "Content-Type: application/json" \
  -d '{"nationalId": "123456789", "password": "password123"}'
```

### Test Authentication (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"nationalId": "ADMIN001", "password": "admin123"}'
```

### Test Child Records API
```bash
# Batch upload records (requires field rep token)
curl -X POST http://localhost:5000/api/children/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"records": [{"name": "Test Child", "age": 5}]}'

# Get all records (requires admin token)
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:5000/api/children

# Get stats (requires admin token)
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:5000/api/children/stats
```

## 🚀 Production Deployment

### Environment Setup
Create `.env` file in `child-health-backend/`:
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
MONGODB_URI=mongodb://localhost:27017/child-health-db
JWT_SECRET=your-secure-secret-key-here
```

### Build for Production
```bash
# Build frontend
cd child-health-app
npm run build

# Start backend in production
cd child-health-backend
NODE_ENV=production npm start
```

## 🎯 Complete Feature List

### ✅ Mandatory Features (All Complete)
1. **New Child Data Collection Form** - Complete with photo, validation
2. **Offline Data Collection** - IndexedDB, local storage, PWA
3. **Data Upload & Sync** - eSignet auth, automatic sync
4. **Data History and Tracking** - Status tracking, upload confirmation
5. **Representative Profile** - Authentication with eSignet
6. **PDF Health Booklet API** - Professional PDF generation

### ✅ Additional Features (All Complete)
1. **Admin Portal** - Complete data management interface
2. **Analytics Dashboard** - Charts, trends, insights
3. **Mobile Optimization** - PWA, touch-friendly, responsive
4. **Enhanced eSignet** - Real MOSIP authentication patterns
5. **Database Integration** - MongoDB with fallback support

## 🧪 Testing Scenarios

### Scenario 1: Field Worker Offline
1. Disconnect internet
2. Add new child record
3. Data stored locally
4. Reconnect internet
5. Go to Sync page, authenticate, upload

### Scenario 2: Admin Review
1. Go to /admin portal
2. View uploaded records
3. Filter by date/status
4. Download health booklet PDF
5. Export data to CSV

### Scenario 3: Mobile Use
1. Open on mobile device
2. Install as PWA
3. Use touch navigation
4. Test offline functionality
5. Sync when online

## 📊 Performance Notes
- **Frontend**: Vite dev server (hot reload)
- **Backend**: Express with auto-restart
- **Database**: MongoDB optional (uses fallback)
- **PWA**: Service worker caching
- **Mobile**: Touch-optimized UI

## 🔍 Troubleshooting

### Common Issues
1. **Port already in use**: Change ports in config
2. **Node.js warnings**: App works despite version warnings
3. **MongoDB connection**: App continues without database
4. **CORS errors**: Backend configured for localhost:5173

### Reset Application
```bash
# Clear all data and restart
rm -rf child-health-app/node_modules
rm -rf child-health-backend/node_modules
npm install # in both directories
```