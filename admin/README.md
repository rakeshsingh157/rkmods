# RKMODS Admin Panel

Admin panel for managing the RKMODS App Store platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Access

- **Development**: http://localhost:3001
- **Production**: https://admin.rkmods.com

## 📁 Project Structure

```
admin/
├── src/
│   └── app/
│       ├── login/page.tsx      # Admin login
│       └── dashboard/page.tsx  # Admin dashboard
├── package.json
└── .env.local
```

## 🔐 Security

- Runs on separate port (3001) from user frontend (3000)
- Connects to backend API at `http://localhost:5000`
- Should be deployed with IP whitelist in production
- Requires ADMIN role for access

## 🚀 Deployment

Deploy separately from frontend and backend:
- **Recommended**: VPS with IP restrictions
- **Alternative**: Vercel with password protection

## 📝 Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_ADMIN_MODE` - Admin mode flag
