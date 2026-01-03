# 🔐 Getting Firebase Service Account Credentials

## You've Already Done ✅
- Created Firebase project: `creonexviz-837f2`
- Got Web SDK config (for client-side)

## Now You Need: Server-Side Credentials

### **Option 1: Download Service Account JSON** (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `creonexviz-837f2`
3. **Click the gear icon** (⚙️) next to "Project Overview" → **Project settings**
4. **Go to "Service accounts" tab**
5. **Click "Generate new private key"**
6. **Download the JSON file** (it will be named something like `creonexviz-837f2-firebase-adminsdk-xxxxx.json`)
7. **Save it as**: `f:\creonex.viz\creonex-platform\server\config\firebase-service-account.json`

### **Option 2: Use Environment Variables** (Simpler for now)

From the same "Service accounts" page, you'll see:
- **Project ID**: `creonexviz-837f2`
- **Client Email**: `firebase-adminsdk-xxxxx@creonexviz-837f2.iam.gserviceaccount.com`
- **Private Key**: (You'll get this from the JSON file)

---

## 🚀 Quick Setup (Recommended)

### **Step 1: Download Service Account**
Follow Option 1 above to download the JSON file.

### **Step 2: Save the File**
Save it to: `f:\creonex.viz\creonex-platform\server\config\firebase-service-account.json`

### **Step 3: Update .env**
I'll create the .env file for you. Just tell me when you've downloaded the service account JSON.

---

## 📝 What to Do Next

**Tell me:**
- **"downloaded service account"** - I'll update the .env file
- **"need help downloading"** - I'll give you more detailed steps with screenshots
- **"use option 2"** - I'll help you extract the credentials manually

---

## ⚠️ Important Notes

1. **Never commit** the service account JSON to git (it's already in .gitignore)
2. **Keep it secure** - it has full access to your Firebase project
3. **For production**, use environment variables instead of the JSON file

---

**Current Status:**
✅ Client-side Firebase config created
⏳ Waiting for server-side service account credentials
