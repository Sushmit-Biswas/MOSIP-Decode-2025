# Child Health Record Booklet Application

## MOSIP Hackathon 2025 - Challenge 07

A PWA application for offline child health data collection in remote areas with secure data upload via eSignet authentication.

## Project Structure

```
child-health-record/
├── child-health-app/          # Frontend (React + Vite + Tailwind)
├── child-health-backend/      # Backend (Node.js + Express)
├── docs/                      # Documentation
└── README.md                  # Project overview
```

## Features

- ✅ Offline data collection for child health records
- ✅ PWA support for mobile and desktop
- ✅ Local storage with IndexedDB
- ✅ eSignet authentication integration
- ✅ PDF health booklet generation
- ✅ Data synchronization when online

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Workbox (PWA)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: eSignet integration
- **Offline Storage**: IndexedDB

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Git

### Development Setup

1. Clone the repository
2. Setup frontend: `cd child-health-app && npm install`
3. Setup backend: `cd child-health-backend && npm install`
4. Start development servers

Detailed setup instructions in `/docs/setup-guide.md`

## License

MIT License - Built for MOSIP Hackathon 2025