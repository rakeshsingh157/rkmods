# RKMODS Frontend

User-facing website for the RKMODS App Store.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Access

- **Development**: http://localhost:3000
- **Production**: https://rkmods.com

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── app/[id]/page.tsx     # App details
│   │   ├── search/page.tsx       # Search
│   │   ├── trending/page.tsx     # Trending
│   │   └── developer/            # Developer portal
│   │       ├── login/page.tsx
│   │       ├── signup/page.tsx
│   │       └── dashboard/page.tsx
│   └── components/
│       └── Navbar.tsx
├── package.json
└── .env.local
```

## 🔌 API Integration

Frontend calls backend API at `http://localhost:5000` (development) or `https://api.rkmods.com` (production).

All API calls use `NEXT_PUBLIC_API_URL` environment variable.

## 🚀 Deployment

- **Recommended**: Vercel, Netlify
- **Alternative**: Static hosting (Cloudflare Pages, GitHub Pages)

## 📝 Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key
