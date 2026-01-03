# 🚀 Creonex Platform - Project Overview

## 📌 Project Summary

Converting the static Creonex.viz website into a full-stack React application with admin analytics dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CREONEX PLATFORM                      │
└─────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   CLIENT     │      │    ADMIN     │      │   SERVER     │
│   (React)    │◄────►│   (React)    │◄────►│  (Node.js)   │
│              │      │              │      │              │
│ - Website    │      │ - Dashboard  │      │ - REST API   │
│ - Tracking   │      │ - Analytics  │      │ - Database   │
│ - Contact    │      │ - Auth       │      │ - Auth       │
└──────────────┘      └──────────────┘      └──────────────┘
      │                      │                      │
      │                      │                      │
      └──────────────────────┴──────────────────────┘
                             │
                      ┌──────▼──────┐
                      │   MongoDB   │
                      │  (Database) │
                      └─────────────┘
```

---

## 📦 Applications

### 1. **Client App** (Customer Website)
**Port**: 5173
**URL**: https://creonex.viz (production)

**Features**:
- All current website features
- Dual theme (light/dark)
- Intro animation
- Visitor tracking (anonymous)
- Contact form
- Service inquiries
- Responsive design

**Tech Stack**:
- React 18
- Vite
- React Router
- Axios
- Lucide React Icons
- CSS Modules / Tailwind

---

### 2. **Admin Dashboard**
**Port**: 5174
**URL**: https://admin.creonex.viz (production)

**Features**:
- **Authentication**
  - Secure login
  - JWT-based auth
  - Session management

- **Analytics Dashboard**
  - Total visitors (all-time)
  - Active users (real-time)
  - Daily/Weekly/Monthly stats
  - Page view tracking
  - Traffic sources
  - Device breakdown

- **Data Management**
  - Contact form submissions
  - Service inquiries
  - Export data (CSV/Excel)

- **Visualizations**
  - Line charts (visitors over time)
  - Bar charts (page views)
  - Pie charts (device types)
  - Real-time counters

**Tech Stack**:
- React 18
- Vite
- React Router
- Axios
- Recharts / Chart.js
- JWT for auth

---

### 3. **Backend API**
**Port**: 3000
**URL**: https://api.creonex.viz (production)

**Features**:
- RESTful API
- JWT authentication
- Visitor tracking
- Analytics aggregation
- Contact form handling
- Real-time updates

**Endpoints**:
```
POST   /api/visitors/track       - Track visitor
GET    /api/analytics/overview   - Get overview stats
GET    /api/analytics/visitors   - Get visitor data
GET    /api/analytics/pageviews  - Get page views
POST   /api/contacts              - Submit contact form
GET    /api/contacts              - Get all contacts (admin)
POST   /api/auth/login            - Admin login
GET    /api/auth/verify           - Verify JWT token
```

**Tech Stack**:
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Bcrypt
- CORS

---

## 📊 Database Schema

### **Visitors Collection**
```javascript
{
  _id: ObjectId,
  sessionId: String,
  ipAddress: String (hashed),
  userAgent: String,
  device: String,
  browser: String,
  country: String,
  city: String,
  firstVisit: Date,
  lastVisit: Date,
  pageViews: Number,
  visitDuration: Number
}
```

### **PageViews Collection**
```javascript
{
  _id: ObjectId,
  sessionId: String,
  page: String,
  timestamp: Date,
  duration: Number
}
```

### **Contacts Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  message: String,
  service: String,
  status: String,
  createdAt: Date
}
```

### **Admins Collection**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  createdAt: Date
}
```

---

## 🎯 Key Features

### **Visitor Analytics**
- ✅ Real-time active users
- ✅ Total unique visitors
- ✅ Page view tracking
- ✅ Visit duration
- ✅ Device/Browser detection
- ✅ Geographic location (optional)

### **Admin Dashboard**
- ✅ Secure authentication
- ✅ Real-time data updates
- ✅ Interactive charts
- ✅ Date range filters
- ✅ Export functionality
- ✅ Responsive design

### **Customer Website**
- ✅ All current features preserved
- ✅ Improved performance (React)
- ✅ Better SEO
- ✅ Faster navigation
- ✅ Modern architecture

---

## 🚀 Deployment Plan

### **Client**
- Platform: Vercel / Netlify
- Build: `npm run build`
- Deploy: Automatic on git push
- Cost: FREE

### **Admin**
- Platform: Vercel / Netlify
- Build: `npm run build`
- Deploy: Automatic on git push
- Cost: FREE

### **Server**
- Platform: Railway / Render / Heroku
- Deploy: Docker or Git
- Cost: $5-10/month

### **Database**
- Platform: MongoDB Atlas
- Tier: Free (512MB)
- Upgrade: $9/month (2GB)

**Total Monthly Cost**: $0-20

---

## 📈 Timeline

- **Day 1**: Project setup ✅
- **Day 2-3**: Client app migration
- **Day 4-5**: Admin dashboard
- **Day 6**: Backend API
- **Day 7**: Integration & testing
- **Day 8**: Deployment

**Total**: 8 days

---

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- HTTPS only
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

---

## 📝 Next Steps

1. ✅ Create project structure
2. ⏳ Initialize React apps
3. ⏳ Setup Express server
4. ⏳ Configure MongoDB
5. ⏳ Start development

---

**Status**: 🚧 In Progress
**Created**: December 22, 2025
**Last Updated**: December 22, 2025
