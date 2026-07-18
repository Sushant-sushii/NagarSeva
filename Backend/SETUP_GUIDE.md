# 🚀 Backend Setup & Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Create .env File (if not exists)
Create `Backend/.env` with:
```
MONGO_URI=mongodb://localhost:27017/Sky
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Sky

JWT_SECRET=your_very_secret_key_here_change_this
PORT=3000
NODE_ENV=development
```

### 3. Run the Server
```bash
# Development mode (with auto-restart on file changes)
npm run dev

# Or production mode
node server.js
```

You should see:
```
✅ Server is running on port 3000
📍 API base URL: http://localhost:3000
🔐 Auth routes available at: http://localhost:3000/api/auth
Connected to MongoDB
```

## Testing the API

### Test 1: Server Health Check
```bash
curl http://localhost:3000/health
```
Expected Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Test 2: Get API Documentation
```bash
curl http://localhost:3000/
```

### Test 3: Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "LastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "wardNumber": "W123",
    "role": "citizen"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "firstName": "John",
    "LastName": "Doe",
    "email": "john@example.com",
    "role": "citizen",
    "wardNumber": "W123"
  }
}
```

### Test 4: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test 5: Get User Profile (Requires Token)
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### ❌ Port 3000 Already in Use
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### ❌ Cannot Find Module
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ❌ MongoDB Connection Error
- Check `MONGO_URI` in `.env` is correct
- Ensure MongoDB is running locally or Atlas is accessible
- Check network connectivity

### ❌ 404 Errors
- Ensure you're hitting `/api/auth/...` not just `/auth/...`
- Verify server is running on port 3000
- Check that routes are registered (see `npm run dev` output)

## File Structure
```
Backend/
├── server.js                          # Server entry point
├── src/
│   ├── app.js                        # Express app configuration
│   ├── controllers/
│   │   └── auth.controller.js        # Auth logic
│   ├── routes/
│   │   └── auth.routes.js            # Auth endpoints
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── validation.middleware.js  # Input validation
│   │   └── errorHandler.middleware.js # Error handling
│   ├── model/
│   │   └── User.model.js             # Mongoose User schema
│   └── db/
│       └── db.js                     # Database connection
├── package.json
├── .env                              # Environment variables
└── debug.js                          # Debug script
```

## Frontend Integration

When calling from frontend, use:
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    LastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    wardNumber: 'W123'
  })
});
```

For protected routes:
```javascript
const response = await fetch('http://localhost:3000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Available Endpoints

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/health` - Auth service health check

### Protected Routes (Require Authorization Header with JWT)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Utility Routes
- `GET /` - API documentation
- `GET /health` - Server health check

---

If you still encounter 404 errors after this setup, please verify:
1. ✅ Server is running (check console)
2. ✅ You're using correct endpoint URL (`/api/auth/...`)
3. ✅ Request method is correct (POST for register/login, GET for profile, etc.)
4. ✅ Content-Type header is set to 'application/json'
