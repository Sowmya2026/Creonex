# 🔧 MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### 1️⃣ Create MongoDB Atlas Account

1. **Visit**: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. **Sign up** using Google, GitHub, or email
3. **Complete** the registration form

---

### 2️⃣ Create a Free Cluster

1. After logging in, click **"Build a Database"** or **"Create"**
2. Choose **"M0 FREE"** tier (completely free forever)
3. Select a **Cloud Provider** (AWS, Google Cloud, or Azure - any is fine)
4. Choose a **Region** closest to you (e.g., Mumbai for India)
5. **Cluster Name**: Leave as default or name it `Cluster0`
6. Click **"Create Cluster"** (takes 3-5 minutes to provision)

---

### 3️⃣ Create Database User

1. On the left sidebar, click **"Database Access"** under Security
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. **Username**: `creonex_admin` (or any username you prefer)
5. **Password**: Click "Autogenerate Secure Password" or create your own
   - ⚠️ **IMPORTANT**: Copy and save this password somewhere safe!
6. **Database User Privileges**: Select **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

---

### 4️⃣ Configure Network Access

1. On the left sidebar, click **"Network Access"** under Security
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, you should restrict this to specific IPs
4. Click **"Confirm"**

---

### 5️⃣ Get Your Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. **Driver**: Select **"Node.js"**
5. **Version**: Select latest version (e.g., 4.1 or later)
6. **Copy** the connection string - it looks like:
   ```
   mongodb+srv://creonex_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

### 6️⃣ Update Your Connection String

1. **Replace** `<password>` with the actual password you created in Step 3
2. **Add** the database name `creonex_viz` after `.net/`:
   ```
   mongodb+srv://creonex_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/creonex_viz?retryWrites=true&w=majority
   ```

---

### 7️⃣ Update Your .env File

1. Open `f:\creonex.viz\creonex-platform\server\.env`
2. Update the `MONGODB_URI` with your connection string
3. Update the `JWT_SECRET` to a random secure string

**Example `.env` file:**
```env
MONGODB_URI=mongodb+srv://creonex_admin:MySecurePass123@cluster0.abc123.mongodb.net/creonex_viz?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_jwt_key_12345
PORT=5000
```

---

## ✅ Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created and running
- [ ] Database user created with password saved
- [ ] Network access configured (0.0.0.0/0 for development)
- [ ] Connection string copied and password replaced
- [ ] Database name `creonex_viz` added to connection string
- [ ] `.env` file updated with connection string
- [ ] `.env` file updated with JWT_SECRET

---

## 🚀 After Setup

Once you've completed all steps above, tell me **"mongodb configured"** and I will:
1. Restart the server with the new connection
2. Seed the database with an admin user
3. Test the login functionality
4. Verify everything is working

---

## 🆘 Troubleshooting

**Issue**: Can't connect to MongoDB
- ✅ Check if password in connection string is correct (no special characters need URL encoding)
- ✅ Verify network access is set to 0.0.0.0/0
- ✅ Ensure cluster is fully provisioned (green status)

**Issue**: Special characters in password
- If your password has special characters like `@`, `#`, `%`, etc., you need to URL encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`
  - Or just generate a new password without special characters

---

**Need help?** Let me know if you get stuck at any step!
