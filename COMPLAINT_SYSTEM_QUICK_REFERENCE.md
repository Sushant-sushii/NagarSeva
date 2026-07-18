# Complaint Management System - Quick Reference Guide

## Files Created

### Backend (3 files)
1. ✅ **Backend/src/controllers/complain.controller.js** (300+ lines)
   - 9 controller functions for all complaint operations
   - Full error handling and validation
   - Geospatial query support
   - Statistics aggregation

2. ✅ **Backend/src/routes/complain.routes.js** (51 lines)
   - 11 route endpoints
   - Public and protected routes
   - Authentication middleware integration

3. ✅ **Backend/src/app.js** (MODIFIED)
   - Imported complaint routes
   - Registered at `/api/complains`
   - Updated health check endpoint

### Frontend (1 file)
4. ✅ **Frontend/src/api/complainAPI.js** (160+ lines)
   - 9 API functions for frontend integration
   - Cookie-based authentication ready
   - Query parameter support for filtering

---

## API Endpoints Summary

### Public Endpoints
| Method | Endpoint | Function | Returns |
|--------|----------|----------|---------|
| GET | `/` | Get all complaints | List with pagination |
| GET | `/:id` | Get single complaint | Complaint details |
| GET | `/nearby/:lat/:lon/:radius` | Geospatial search | Complaints in radius |
| GET | `/stats/:wardNumber` | Ward statistics | Stats object |

### Protected Endpoints (require auth)
| Method | Endpoint | Function | Who |
|--------|----------|----------|-----|
| POST | `/create` | Create complaint | Citizen |
| GET | `/user/:userId` | Get user complaints | Citizen (own only via auth) |
| PUT | `/:id/status` | Update status | Official/Admin |
| PUT | `/:id` | Update complaint | Official/Admin |
| DELETE | `/:id` | Delete complaint | Creator/Admin |

---

## Frontend Integration Examples

```javascript
// Import
import { createComplaint, getAllComplaints, getNearbyComplaints } from '@/api/complainAPI';

// 1. Create complaint
try {
  const response = await createComplaint({
    location: { latitude: 19.0760, longitude: 72.8777 },
    category: 'Streetlight Out',
    department: 'Electrical',
    severity: 'High',
    wardNumber: 'Ward A',
    imageUrl: 'base64string...',
    isSafetyHazardAtNight: true
  });
  console.log('Complaint created:', response.data);
} catch (error) {
  console.error('Failed to create complaint:', error.message);
}

// 2. Get filtered complaints
const response = await getAllComplaints({
  status: 'Open',
  severity: 'High',
  wardNumber: 'Ward A',
  page: 1,
  limit: 10
});
console.log(`Found ${response.pagination.total} complaints`);

// 3. Get nearby complaints
const nearby = await getNearbyComplaints(19.0760, 72.8777, 5000); // 5km radius
console.log(`${nearby.data.length} complaints nearby`);

// 4. Update complaint status
const updated = await updateComplaintStatus(complaintId, 'Resolved');

// 5. Get ward statistics
const stats = await getWardStats('Ward A');
console.log(`Ward A: ${stats.data.total} complaints, ${stats.data.byStatus.Open} open`);
```

---

## Authentication Flow

1. **User logs in** → Server sets HTTP-only `authToken` cookie
2. **Frontend makes request** → Automatically sends cookie via `credentials: 'include'`
3. **Backend authMiddleware** → Validates token from cookie
4. **Protected endpoints** → Only accessible with valid token
5. **User logs out** → Server clears authToken cookie

---

## Key Implementation Details

### Location Data
- **Frontend sends:** `{ latitude, longitude }`
- **Backend stores:** GeoJSON `{ type: 'Point', coordinates: [longitude, latitude] }`
- **Database:** 2dsphere index for fast geospatial queries

### Status Flow
- **Initial:** Open
- **Options:** Open → Resolved (sets resolvedAt timestamp) or Open → Escalated
- **Resolved:** Sets resolvedAt to current date automatically

### Permissions
- **View (GET):** Public access
- **Create:** Authenticated citizen (req.user.id)
- **Update:** Admin/Official role
- **Delete:** Creator or Admin role

---

## Testing Checklist

```javascript
// 1. Unauthenticated Access
GET /api/complains ✅ (works - public)
POST /api/complains/create ❌ (fails - auth required)

// 2. Create & Retrieve
POST /api/complains/create ✅ (authenticated)
GET /api/complains/:id ✅ (public - can view complaint)
GET /api/complains/user/:userId ✅ (auth required)

// 3. Geospatial
GET /api/complains/nearby/19.0760/72.8777/5000 ✅ (finds within 5km)

// 4. Statistics
GET /api/complains/stats/Ward%20A ✅ (shows Ward A stats)

// 5. Update & Delete
PUT /api/complains/:id/status ✅ (admin only)
DELETE /api/complains/:id ✅ (creator/admin only)
```

---

## Database Indexes

The Complain model includes:
- **2dsphere index** on `location` field for geospatial queries
- **Automatic timestamps:** createdAt, updatedAt (timestamps: true)
- **Foreign key:** citizenId references User model

---

## Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details (dev environment)"
}
```

---

## Status Codes Used

- **200** - Success (GET, successful PUT)
- **201** - Created (POST complaint)
- **400** - Bad request (invalid data, missing fields)
- **401** - Unauthorized (no token or expired)
- **403** - Forbidden (user lacks permission)
- **404** - Not found (complaint/user not found)
- **500** - Server error

---

## Next Steps

1. **Test endpoints** with Postman/Thunder Client
2. **Create React components** for complaint form, list, filters
3. **Add map visualization** for geospatial data (Leaflet)
4. **Implement real-time updates** for status changes (WebSocket)
5. **Add admin dashboard** for statistics and complaint management
6. **Setup automated email** notifications for status updates

---

**All files ready for production integration!** ✅
