# Backend API Structure

The backend is now organized into three separate folders for better maintainability:

## 📁 `/api/user/*` - User Portal APIs
For regular users browsing and reviewing apps.

**Authentication:**
- `POST /api/user/auth/signup` - User registration
- `POST /api/user/auth/login` - User login
- `GET /api/user/auth/verify-email` - Email verification

**Features (To be implemented):**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/reviews` - Get user's reviews
- `DELETE /api/user/reviews/:id` - Delete user's review

---

## 📁 `/api/developer/*` - Developer Portal APIs
For developers managing their apps.

**Authentication:**
- `POST /api/developer/auth/signup` - Developer registration
- `POST /api/developer/auth/login` - Developer login
- `GET /api/developer/auth/verify-email` - Email verification

**App Management (To be implemented):**
- `GET /api/developer/apps` - List developer's apps
- `POST /api/developer/apps` - Upload new app
- `GET /api/developer/apps/:id` - Get app details
- `PUT /api/developer/apps/:id` - Update app
- `DELETE /api/developer/apps/:id` - Delete app

**Reviews (To be implemented):**
- `GET /api/developer/reviews` - Get all reviews for developer's apps
- `POST /api/developer/reviews/:id/reply` - Reply to review

**Analytics (To be implemented):**
- `GET /api/developer/stats` - Get developer statistics
- `GET /api/developer/downloads` - Get download analytics

---

## 📁 `/api/admin/*` - Admin Panel APIs
For platform administrators.

**Authentication:**
- `POST /api/admin/auth/login` - Admin login (no public signup)

**Developer Management (To be implemented):**
- `GET /api/admin/developers` - List all developers
- `GET /api/admin/developers/:id` - Get developer details
- `PUT /api/admin/developers/:id/suspend` - Suspend developer
- `PUT /api/admin/developers/:id/activate` - Activate developer

**App Moderation (To be implemented):**
- `GET /api/admin/apps` - List all apps (with filters)
- `GET /api/admin/apps/pending` - List pending apps
- `POST /api/admin/apps/:id/approve` - Approve app
- `POST /api/admin/apps/:id/reject` - Reject app

**Support (To be implemented):**
- `GET /api/admin/support/tickets` - List support tickets
- `POST /api/admin/support/tickets/:id/message` - Send message
- `PUT /api/admin/support/tickets/:id/close` - Close ticket

**Analytics (To be implemented):**
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/actions` - Admin action logs

---

## 📁 `/api/auth/*` - Shared Auth APIs
Common authentication endpoints.

- `POST /api/auth/refresh` - Refresh access token (all roles)
- `POST /api/auth/logout` - Logout (all roles)

---

## File Structure

```
src/app/api/
├── user/
│   ├── auth/
│   │   ├── signup/route.ts ✅
│   │   ├── login/route.ts ✅
│   │   └── verify-email/route.ts (uses shared)
│   ├── profile/route.ts
│   └── reviews/route.ts
│
├── developer/
│   ├── auth/
│   │   ├── signup/route.ts ✅
│   │   ├── login/route.ts ✅
│   │   └── verify-email/route.ts ✅
│   ├── apps/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── reviews/
│   │   └── route.ts
│   └── stats/route.ts
│
├── admin/
│   ├── auth/
│   │   └── login/route.ts ✅
│   ├── developers/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── apps/
│   │   ├── route.ts
│   │   ├── pending/route.ts
│   │   └── [id]/
│   │       ├── approve/route.ts
│   │       └── reject/route.ts
│   ├── support/route.ts
│   └── stats/route.ts
│
└── auth/
    ├── refresh/route.ts ✅
    └── logout/route.ts ✅
```

This structure provides clear separation of concerns and makes it easy to apply role-specific middleware and logic.
