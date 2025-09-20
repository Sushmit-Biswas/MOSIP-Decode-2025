# Child Health Record System

## 📋 Overview

The Child Health Record System is a comprehensive offline-first application designed for field health workers to collect critical child health data in remote areas with limited internet connectivity. Built for the MOSIP Decode Challenge 2025, it features secure eSignet authentication, GPS location tracking, and seamless data synchronization.

## 🚀 Key Features

### Core Functionality
- **Offline-First Architecture**: Collect and store data without internet connectivity
- **eSignet Authentication**: Secure MOSIP eSignet OAuth 2.0/OIDC integration
- **GPS Location Tracking**: Accurate geolocation capture with fallback options
- **Real-time Synchronization**: Auto-sync when internet connection is restored
- **Health ID Generation**: Unique identifiers for each child record
- **Photo Capture**: Child photo capture and storage
- **BMI Calculation**: Automatic BMI calculation and categorization

### User Roles
- **Field Representatives**: Data collection in remote areas
- **Administrators**: Dashboard access, analytics, and data management

### Technical Features
- **Progressive Web App (PWA)**: Installable on mobile devices
- **IndexedDB Storage**: Local data persistence
- **Toast Notifications**: Real-time user feedback
- **Responsive Design**: Mobile-first, desktop-compatible
- **MongoDB Integration**: Scalable cloud database support

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Hot Toast** - Notification system
- **IndexedDB** - Local storage
- **PWA** - Progressive Web App capabilities

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### Authentication
- **MOSIP eSignet** - Identity verification
- **OAuth 2.0/OIDC** - Authentication protocol
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
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # eSignet Configuration (Optional - for production)
   ESIGNET_CLIENT_ID=your-esignet-client-id
   ESIGNET_CLIENT_SECRET=your-esignet-client-secret
   ESIGNET_BASE_URL=https://esignet.collab.mosip.net
   
   # CORS Configuration
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../child-health-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the frontend directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api
   
   # eSignet Configuration
   VITE_ESIGNET_URL=https://esignet.collab.mosip.net
   VITE_ESIGNET_CLIENT_ID=child-health-client
   VITE_ESIGNET_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create a New Cluster

1. **Click "Create"** to start building your cluster
2. **Choose deployment option**: Select "Shared" for free tier
3. **Cloud Provider & Region**: Choose your preferred provider and region
4. **Cluster Tier**: Select M0 Sandbox (Free)
5. **Cluster Name**: Enter "child-health-cluster" or your preferred name
6. **Click "Create Cluster"**

### Step 3: Configure Database Access

1. **Go to "Database Access"** in the left sidebar
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: Create a username (e.g., "admin")
5. **Password**: Generate a secure password (save this!)
6. **Database User Privileges**: Select "Read and write to any database"
7. **Click "Add User"**

### Step 4: Configure Network Access

1. **Go to "Network Access"** in the left sidebar
2. **Click "Add IP Address"**
3. **Add Current IP Address** or **Allow Access from Anywhere** (0.0.0.0/0) for development
4. **Click "Confirm"**

### Step 5: Get Connection String

1. **Go to "Clusters"** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string**

Example connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Update Environment Variables

Replace the connection string in your `.env` file:
```env
MONGODB_URI=mongodb+srv://admin:your-password@cluster0.xxxxx.mongodb.net/child-health-app?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Add `/child-health-app` before the `?` to specify the database name

### Step 7: Test Connection

1. Start your backend server: `npm start`
2. Look for the success message: "✅ MongoDB Connected: cluster0.xxxxx.mongodb.net"
3. Check that the database name appears: "📊 Database: child-health-app"

### Troubleshooting MongoDB Connection

#### Common Issues:

**1. "ENOTFOUND" Error**
- Check your internet connection
- Verify the connection string URL
- Ensure MongoDB Atlas cluster is running

**2. Authentication Failed**
- Verify username and password in connection string
- Check Database Access settings in Atlas
- Ensure user has proper permissions

**3. "IP Not Whitelisted"**
- Add your IP address to Network Access in Atlas
- For development, you can allow all IPs (0.0.0.0/0)

**4. Connection Timeout**
- Check firewall settings
- Try different network (mobile hotspot)
- Verify cluster region selection

## 🔐 Authentication Setup

### Development Mode
For testing and development, the application includes mock authentication:

**Field Representative Login:**
- National ID: Any value
- OTP: 123456 or 000000

**Admin Login:**
- National ID: ADMIN001, ADMIN123, or admin
- OTP: 123456 or 000000

### Production eSignet Integration

To integrate with real MOSIP eSignet:

1. **Register with MOSIP**
   - Visit [MOSIP Partner Portal](https://partner.collab.mosip.net)
   - Register as an authentication partner
   - Obtain client credentials

2. **Update Environment Variables**
   ```env
   VITE_ESIGNET_CLIENT_ID=your-real-client-id
   ESIGNET_CLIENT_SECRET=your-real-client-secret
   ```

3. **Configure OAuth Endpoints**
   - The application is pre-configured for MOSIP eSignet endpoints
   - Customize URLs in `eSignetService.js` if needed

## 📱 Usage Guide

### For Field Representatives

1. **Access the Application**
   - Open the application URL
   - Click "Login as Field Representative"

2. **Authentication**
   - Enter your National ID
   - Click "Send OTP"
   - Enter the received OTP
   - Click "Login"

3. **Collect Child Data**
   - Click "Add New Child Record"
   - Fill in child information
   - Capture child's photo
   - Location is auto-captured
   - Review and submit

4. **Offline Work**
   - Continue collecting data without internet
   - Records are stored locally
   - Auto-sync when connection restored

5. **Data Synchronization**
   - Go to "Sync" page
   - Authenticate if required
   - Click "Upload All Records"
   - Monitor sync progress

### For Administrators

1. **Access Admin Dashboard**
   - Click "Login as Administrator"
   - Use admin credentials
   - Access analytics and reports

2. **View Collected Data**
   - Browse child records
   - Filter and search data
   - Export reports
   - Download health booklets

## 🏗️ Project Structure

```
child-health-system/
├── child-health-app/          # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and utility services
│   │   └── assets/          # Images and resources
│   └── package.json
├── child-health-backend/      # Backend Node.js application
│   ├── config/              # Database and app configuration
│   ├── models/              # MongoDB data models
│   ├── routes/              # API route handlers
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic services
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   cd child-health-app
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables in deployment platform**

### Backend Deployment (Railway/Heroku)

1. **Prepare for deployment**
   ```bash
   cd child-health-backend
   ```

2. **Set production environment variables**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Strong secret key
   - `NODE_ENV`: production

3. **Deploy to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway deploy
   ```

### Environment Variables for Production

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/child-health-app
JWT_SECRET=your-super-secure-secret-key
CLIENT_URL=https://your-frontend-domain.com
```

**Frontend (.env)**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_ESIGNET_URL=https://esignet.collab.mosip.net
VITE_ESIGNET_CLIENT_ID=your-production-client-id
```

## 🧪 Testing

### Run Frontend Tests
```bash
cd child-health-app
npm run test
```

### Run Backend Tests
```bash
cd child-health-backend
npm run test
```

### Manual Testing Checklist

- [ ] Field representative login
- [ ] Admin login
- [ ] Child record creation
- [ ] Photo capture
- [ ] Location capture
- [ ] Offline functionality
- [ ] Data synchronization
- [ ] Health ID generation
- [ ] PDF export
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is developed for the MOSIP Decode Challenge 2025.

## 🆘 Support

For issues and support:

1. **Check the troubleshooting section above**
2. **Review MongoDB Atlas documentation**
3. **Check MOSIP eSignet documentation**
4. **Create an issue in the repository**

## 📚 Additional Resources

- [MOSIP eSignet Documentation](https://docs.esignet.io/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

**Built with ❤️ for the MOSIP Decode Challenge 2025**