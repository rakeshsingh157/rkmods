# Frontend Structure Documentation

## 📁 Complete Folder Structure

```
src/app/
├── (user)/                    ← User-facing pages (public)
│   ├── page.tsx              ← Homepage (existing)
│   ├── app/[id]/page.tsx     ← App details (existing)
│   ├── search/page.tsx       ← Search page (existing)
│   └── trending/page.tsx     ← Trending apps (existing)
│
├── developer/                 ← Developer Portal (protected)
│   ├── signup/page.tsx       ✅ Developer registration
│   ├── login/page.tsx        ✅ Developer login
│   ├── verify-email/page.tsx ✅ Email verification
│   ├── dashboard/page.tsx    ✅ Developer dashboard
│   ├── apps/page.tsx         ✅ Manage apps (placeholder)
│   └── upload/page.tsx       ✅ Upload new app (placeholder)
│
└── admin/                     ← Admin Panel (protected)
    ├── login/page.tsx        ✅ Admin login
    └── dashboard/page.tsx    ✅ Admin dashboard

api/                           ← Backend API Routes
├── user/
│   └── auth/
│       ├── signup/route.ts   ✅
│       └── login/route.ts    ✅
├── developer/
│   └── auth/
│       ├── signup/route.ts   ✅
│       ├── login/route.ts    ✅
│       └── verify-email/route.ts ✅
├── admin/
│   └── auth/
│       └── login/route.ts    ✅
└── auth/
    ├── refresh/route.ts      ✅
    └── logout/route.ts       ✅
```

---

## 🎨 Portal Themes

### User Portal (Public)
- **Theme**: Vibrant, modern, welcoming
- **Colors**: Cyan/Blue gradients
- **Access**: Public (no login required for browsing)

### Developer Portal
- **Theme**: Professional, clean, functional
- **Colors**: Cyan/Blue (matches user portal)
- **Access**: Protected (requires developer account)
- **Routes**:
  - `/developer/signup` - Create developer account
  - `/developer/login` - Developer login
  - `/developer/dashboard` - Main dashboard
  - `/developer/apps` - Manage apps
  - `/developer/upload` - Upload new app

### Admin Panel
- **Theme**: Authoritative, secure, powerful
- **Colors**: Red/Orange (distinct from user/developer)
- **Access**: Protected (requires admin account)
- **Routes**:
  - `/admin/login` - Admin login (no public signup)
  - `/admin/dashboard` - Platform overview
  - `/admin/apps` - Manage all apps
  - `/admin/apps/pending` - Approve/reject apps
  - `/admin/developers` - Manage developers
  - `/admin/support` - Support tickets

---

## 🔐 Authentication Flow

### Developer Flow
1. Visit `/developer/signup`
2. Enter email and password
3. Receive verification email
4. Click link → `/developer/verify-email?token=xxx`
5. Redirect to `/developer/login`
6. Login → Redirect to `/developer/dashboard`

### Admin Flow
1. Visit `/admin/login` (no public signup)
2. Enter admin credentials
3. Login → Redirect to `/admin/dashboard`

### User Flow (Optional)
1. Browse apps without login
2. Optional: Create account for reviews
3. Visit `/user/signup` or `/user/login`

---

## 🛡️ Route Protection

All protected routes check for:
- Valid access token in localStorage
- Correct user role (DEVELOPER or ADMIN)
- Redirect to login if unauthorized

Example protection code:
```typescript
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    router.push('/developer/login');
    return;
  }
  
  const user = JSON.parse(userData);
  if (user.role !== 'DEVELOPER') {
    router.push('/');
    return;
  }
}, [router]);
```

---

## 📱 Responsive Design

All pages are fully responsive:
- Mobile-first approach
- Tailwind CSS breakpoints
- Touch-friendly buttons
- Optimized forms

---

## 🎯 Next Steps

### Phase 4: Developer Features
- [ ] Implement app upload functionality
- [ ] Create app management page (edit, delete)
- [ ] Add download statistics
- [ ] Review management system

### Phase 5: Admin Features
- [ ] App approval system
- [ ] Developer management
- [ ] Support ticket system
- [ ] Platform analytics

### Phase 6: User Features
- [ ] User signup/login pages
- [ ] Enhanced review system
- [ ] User profile page
