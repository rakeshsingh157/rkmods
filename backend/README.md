# RKMODS Backend API

Backend API server for the RKMODS App Store platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run database migration
npm run migrate

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js           # Express server entry point
│   ├── routes/
│   │   ├── user/           # User API routes
│   │   ├── developer/      # Developer API routes
│   │   ├── admin/          # Admin API routes
│   │   └── auth/           # Shared auth routes
│   ├── lib/
│   │   ├── auth.js         # Authentication utilities
│   │   ├── security.js     # Security validation
│   │   ├── trustScore.js   # Spam detection
│   │   ├── email.js        # Email service
│   │   ├── rateLimit.js    # Rate limiting
│   │   └── db.js           # Database connection
│   ├── middleware/
│   │   ├── authenticate.js # JWT authentication
│   │   └── authorize.js    # Role-based access
│   └── config/
│       └── security.js     # Security constants
├── scripts/
│   └── migrate-secure-schema.js
├── package.json
└── .env
```

## 🔌 API Endpoints

### User Routes (`/api/user`)
- `POST /api/user/auth/signup` - User registration
- `POST /api/user/auth/login` - User login

### Developer Routes (`/api/developer`)
- `POST /api/developer/auth/signup` - Developer registration
- `POST /api/developer/auth/login` - Developer login
- `GET /api/developer/auth/verify-email` - Email verification

### Admin Routes (`/api/admin`)
- `POST /api/admin/auth/login` - Admin login

### Shared Auth Routes (`/api/auth`)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

## 🌍 Environment Variables

See `.env` file for configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `CORS_ORIGIN` - Allowed origins (comma-separated)
- `PORT` - Server port (default: 5000)

## 🔐 Security Features

- ✅ Helmet.js for security headers
- ✅ CORS protection
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ Input sanitization
- ✅ XSS protection

## 📦 Deployment

This backend can be deployed separately from the frontend:
- **Recommended**: VPS (DigitalOcean, AWS EC2, Linode)
- **Alternative**: Heroku, Railway, Render

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health

# Test signup
curl -X POST http://localhost:5000/api/user/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```
