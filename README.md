# Sehat Saathi - Child Health Record System

**Offline-first PWA for field health workers to collect child health data in remote areas with limited connectivity.**

## Features
- **Offline-First**: Store data locally, sync when online
- **eSignet Integration**: MOSIP OAuth 2.0/OIDC authentication  
- **PWA**: Installable on mobile devices
- **GPS Tracking**: Location capture for field visits
- **Photo Upload**: Child photo storage
- **Real-time Sync**: Auto-sync when internet restored

## Technology Stack
**Frontend**: React 19.1.1, Vite 7.1.6, Tailwind CSS  
**Backend**: Node.js, Express 5.1.0, MongoDB, Mongoose 8.18.1  
**Authentication**: JWT, MOSIP eSignet  
**Storage**: IndexedDB (offline), MongoDB (online)
- **JWT Tokens** - Session management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd child-health-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/child-health-app?retryWrites=true&w=majority
   
## Quick Setup

### Backend
```bash
cd child-health-backend
npm install
# Create .env file with MONGODB_URI and JWT_SECRET
npm start
```

### Frontend  
```bash
cd child-health-app
npm install
# Create .env file with VITE_API_URL
npm run dev
```

## Usage
**Field Rep Login**: Any National ID + OTP: 123456  
**Admin Login**: ADMIN001 + OTP: 123456  

## Project Structure
```
sehat-saathi/
├── child-health-app/     # React frontend
├── child-health-backend/ # Node.js API
└── docs/                 # API documentation
```

---

*Built for MOSIP Decode Challenge 2025*