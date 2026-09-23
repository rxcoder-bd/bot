# 🚀 Ads Earn BD - Complete Setup & Deployment Guide

Welcome to **Ads Earn BD** — a high-performance Telegram Mini App and Monetag Ad Watching Platform designed specifically for Bangladeshi users.

---

## 🛠️ Step 1: Firebase Realtime Database Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Build > Realtime Database** and click **Create Database**.
3. Choose location (asia-southeast1 recommended) and start in **Test Mode**.
4. Set Realtime Database **Security Rules**:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
