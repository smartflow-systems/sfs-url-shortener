# SFS URL Shortener

URL shortening service with analytics, custom domains, and link management for SmartFlow Systems.

## Overview

Enterprise-grade URL shortening service with advanced analytics, custom branding, QR code generation, and comprehensive link management capabilities.

## Features

- Short URL generation
- Custom short codes
- Custom domain support
- Click analytics and tracking
- QR code generation
- Link expiration
- Password-protected links
- UTM parameter management
- Bulk link creation
- API access
- Real-time analytics dashboard

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Caching**: Redis
- **Analytics**: Custom + Google Analytics
- **UI**: shadcn/ui, Tailwind CSS, Recharts

## Getting Started

### Installation

```bash
npm install
cp .env.example .env
npm run dev
```

### Creating Short URLs

```typescript
const shortUrl = await createShortUrl({
  originalUrl: 'https://example.com/very-long-url',
  customCode: 'my-link', // optional
  expiresAt: '2025-12-31', // optional
  password: 'secret' // optional
});

console.log(shortUrl); // http://localhost:5003/my-link
```

## API Usage

```bash
# Create short URL
curl -X POST https://api.smartflowsystems.com/shorten \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"url": "https://example.com"}'

# Get analytics
curl https://api.smartflowsystems.com/analytics/abc123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Analytics

Track comprehensive metrics:
- Click count
- Geographic location
- Referrer sources
- Device types
- Browser information
- Click timestamps

## Custom Domains

Configure custom domains for branded short links:

1. Add domain in dashboard
2. Configure DNS CNAME record
3. Verify domain ownership
4. Start creating links

## SmartFlow Design System

Modern link management interface with:
- Real-time analytics charts
- SFS Blue branding
- Responsive tables
- QR code previews

## Development

```bash
npm run dev        # Development server
npm run build      # Production build
npm test           # Run tests
npm run db:push    # Database migrations
```

## License

Proprietary - SmartFlow Systems
