# Creonex Platform - Full Stack React Application

## 🏗️ Project Structure

This is a monorepo containing three applications:
- **client/** - Customer-facing React website (Port 5173)
- **admin/** - Admin dashboard for analytics (Port 5174)
- **server/** - Backend API using Firebase Firestore (Port 5000)

## 📦 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase Project (Service Account JSON required)
- Git installed

### Installation

1. **Install Client Dependencies**
```bash
cd client
npm install
npm run dev
```

2. **Install Admin Dependencies**
```bash
cd admin
npm install
npm run dev
```

3. **Install Server Dependencies**
```bash
cd server
npm install
npm run dev
```

## 🌐 Development URLs

- **Client**: http://localhost:5173
- **Admin**: http://localhost:5174
- **Server**: http://localhost:5000

## 🔧 Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Admin (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Server (.env)
```
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./config/your-service-account.json
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📝 License

Private - Creonex.viz

---

**Created**: December 22, 2025
**Status**: 🚧 In Development
