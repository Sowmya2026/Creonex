# 🚀 Quick Start - MongoDB Setup

## 📋 What You Need to Do

### 1. Set Up MongoDB Atlas (5-10 minutes)
Follow the detailed guide in `MONGODB_SETUP.md`

**Quick Summary:**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create M0 FREE cluster
3. Create database user (save password!)
4. Set network access to 0.0.0.0/0
5. Get connection string and replace `<password>`

---

### 2. Update .env File

Edit: `f:\creonex.viz\creonex-platform\server\.env`

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/creonex_viz?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_here
PORT=5000
```

⚠️ **Important**: 
- Replace `username` and `password` with your actual credentials
- Change `JWT_SECRET` to any random string
- Don't commit this file to git (it's already in .gitignore)

---

### 3. Test Connection

```bash
cd f:\creonex.viz\creonex-platform\server
npm run test-db
```

✅ If successful, you'll see: "MongoDB Connected Successfully!"

---

### 4. Seed Admin User

```bash
npm run seed
```

This creates:
- **Username**: `admin`
- **Password**: `password123`

⚠️ Change this password after first login!

---

### 5. Restart Server

Stop the current server (Ctrl+C) and restart:

```bash
npm start
```

Or use nodemon for auto-restart:

```bash
npm run dev
```

---

### 6. Test Login

1. Go to http://localhost:5173/login
2. Login with:
   - Username: `admin`
   - Password: `password123`

---

## 🎯 Commands Reference

| Command | Description |
|---------|-------------|
| `npm run test-db` | Test MongoDB connection |
| `npm run seed` | Create admin user |
| `npm start` | Start server (production) |
| `npm run dev` | Start server with auto-reload |

---

## 📞 When You're Ready

After completing the setup, tell me:
- **"mongodb configured"** - I'll help you test everything
- **"stuck at step X"** - I'll help troubleshoot
- **"show me .env example"** - I'll show you a complete example

---

## 🔗 Useful Links

- MongoDB Atlas: https://cloud.mongodb.com
- Setup Guide: `MONGODB_SETUP.md`
- Env Template: `.env.example`
