# 🚀 CIVICPULSE Frontend - START HERE

## ⚡ Quick Start (2 Minutes)

### Step 1: Start Backend (Terminal 1)
```bash
cd Backend
npm start
```
✅ Wait for: `Server is running on port 3000`

### Step 2: Start Frontend (Terminal 2)
```bash
cd Frontend
npm run dev
```
✅ Wait for: `Local: http://localhost:5173`

### Step 3: Open in Browser
```
http://localhost:5173
```

### Step 4: Test Authentication
1. **Sign Up**:
   - Email: `test@example.com`
   - Password: `test123456`
   - Name: `Test User`
   - Confirm: `test123456`
   - Click "Sign Up"
   - Should see Dashboard with welcome message

2. **Logout**: Click "Sign Out" button

3. **Login**:
   - Email: `test@example.com`
   - Password: `test123456`
   - Should see Dashboard again

✅ **Success!** Both Login and Sign Up are working.

---

## 🎯 What You'll See

### Login Page
- CIVICPULSE logo with dark theme
- Email input field
- Password input field
- "Sign In" button (turns gold on hover)
- Link to sign up page
- Form validation (errors shown in red)

### Sign Up Page
- CIVICPULSE logo
- Name, Email, Password, Confirm Password fields
- "Sign Up" button
- Link to login page
- Real-time validation

### Dashboard (After Login)
- Welcome message: "Welcome, Test User! 👋"
- User details card (name, email)
- Status showing "✓ Logged In"
- "Sign Out" button
- Feature cards (Report Issue, Track Status, etc.)

---

## 🔧 Troubleshooting

### ❌ "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Problem**: Backend not running

**Solution**:
1. Open Terminal 1
2. Navigate to Backend folder: `cd Backend`
3. Run: `npm start`
4. Wait for: `Server is running on port 3000`
5. Refresh browser: `Ctrl+R` or `Cmd+R`

### ❌ Blank page on http://localhost:5173
**Problem**: Frontend not running or not fully loaded

**Solution**:
1. Open Terminal 2
2. Navigate to Frontend folder: `cd Frontend`
3. Run: `npm run dev`
4. Wait for: `Local: http://localhost:5173`
5. Refresh browser

### ❌ Form won't submit / Shows error
**Problem**: Validation or backend issue

**Solution**:
1. Check all fields are filled correctly
2. Check email format is valid (has @ and .)
3. Check password is at least 6 characters
4. Ensure backend is running (Terminal 1)
5. Check browser console (F12) for red errors

### ❌ Can't access dashboard without logging in
**This is correct!** It's a protected route.

**Solution**: 
1. Go to `/login`
2. Create account or login with existing credentials
3. Then access `/dashboard`

---

## 📊 API Endpoints Being Used

```
POST   http://localhost:3000/api/auth/login      → Login user
POST   http://localhost:3000/api/auth/register   → Create account
POST   http://localhost:3000/api/auth/logout     → Logout user
GET    http://localhost:3000/api/auth/profile    → Get user info
```

All configured with CORS and working correctly! ✅

---

## 🎨 UI Preview

```
┌─────────────────────────────────────────┐
│         CIVICPULSE                      │
│    Civic Grievance & Safety Agent       │
│                                         │
│    ┌─────────────────────────────────┐  │
│    │  Sign In                        │  │
│    │                                 │  │
│    │  📧 Email                       │  │
│    │  [__________________________]   │  │
│    │                                 │  │
│    │  🔒 Password                    │  │
│    │  [__________________________]   │  │
│    │                                 │  │
│    │  [   SIGN IN    ] (Gold button) │  │
│    │                                 │  │
│    │  New to CIVICPULSE?             │  │
│    │  Sign up ← (Cyan link)          │  │
│    │                                 │  │
│    └─────────────────────────────────┘  │
│                                         │
│  Dark background (#0f172a)              │
│  Gold button (#f59e0b)                  │
│  Cyan link (#06b6d4)                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Features Working

- ✅ User Registration (Sign Up)
- ✅ User Login (Sign In)
- ✅ Protected Dashboard
- ✅ Logout functionality
- ✅ Form validation
- ✅ Error messages
- ✅ Loading spinners
- ✅ Two-way data binding
- ✅ CORS integration
- ✅ Dark theme UI
- ✅ Responsive design
- ✅ Auto-redirect on auth

---

## 📚 Documentation

For detailed information, see:
- **TROUBLESHOOTING.md** - Common issues & solutions
- **QUICK_START.md** - Quick reference guide
- **AUTHENTICATION_SETUP.md** - Complete setup details
- **ARCHITECTURE.md** - Visual diagrams
- **README.md** - Full project overview

---

## 🔐 Security Features

✅ Passwords validated (min 6 characters)  
✅ Email format checked  
✅ Form validation before submission  
✅ Protected routes (can't access dashboard without login)  
✅ HTTP-only cookies (backend managed)  
✅ CORS properly configured  
✅ Error messages don't expose sensitive info  
✅ Secure logout clears all data  

---

## 💡 Pro Tips

1. **Hot Reload**: Changes to files auto-reload (no refresh needed)
2. **DevTools**: Press `F12` to open browser Developer Tools
3. **Console**: Check console for debugging information
4. **Network**: Monitor API calls in DevTools Network tab
5. **React DevTools**: Install extension for better React debugging

---

## 🎓 What's Inside

### Components (4)
- **Login.jsx** - Login form page
- **SignUp.jsx** - Registration form page
- **Dashboard.jsx** - Home page (protected)
- **PrivateRoute.jsx** - Route protection

### State Management (1)
- **AuthContext.jsx** - All auth logic + axios setup

### Styling
- **Tailwind CSS** - All styling done with Tailwind
- **Dark Theme** - CIVICPULSE branded colors
- **Responsive** - Works on mobile, tablet, desktop

---

## 🚀 Next Steps

1. ✅ Test authentication (Done!)
2. ⬜ Integrate complaint system
3. ⬜ Add user profile page
4. ⬜ Deploy to production
5. ⬜ Add advanced features (2FA, password reset, etc.)

---

## 📞 Still Need Help?

1. **Check TROUBLESHOOTING.md** - Most issues covered
2. **Check browser console** - F12 → Console tab
3. **Check terminal output** - See if there are error messages
4. **Verify backend running** - http://localhost:3000 should load
5. **Verify frontend running** - http://localhost:5173 should load

---

## ✨ Summary

You now have a **production-ready** authentication system with:

✅ Beautiful dark theme UI  
✅ Complete login & signup system  
✅ Form validation & error handling  
✅ Protected routes  
✅ Secure authentication  
✅ CORS configured  
✅ Axios integration  
✅ React Router setup  

**Total Setup Time**: 2 minutes  
**Status**: 🟢 Ready to Use  
**Next**: Build complaint system!

---

**Happy Coding! 🎉**

For more details, see the documentation files in the Frontend folder.

Last Updated: July 19, 2026
