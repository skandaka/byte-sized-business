# 🚀 Deployment Guide - Byte-Sized Business Boost

## ✅ What's Been Implemented

### Phase 0: Unblock & Hardening ✅ COMPLETE
- Fixed client/server port configuration (port 5001)
- SafeImage component with proxy fallback working
- High-contrast accessibility mode added
- Text visibility fixed across all components
- HTTPS/mixed-content handling via proxy

### Phase 1: Location & Data Plumbing ✅ COMPLETE
- Database migration added lat/lng columns
- Geocoded 25/26 businesses successfully
- Location picker with geolocation + manual city input
- Radius filtering (1-50 miles)
- Distance calculation and display
- Chicago, IL set as default location
- All queries respect location/radius

### Phase 2: Core UX ✅ COMPLETE
- Location-aware business listings
- Clickable delivery badges with hover effects
- External business blending enabled
- Partner offers integration
- Distance shown on business cards
- Image proxy with placeholder fallback

### Phase 6: Feature Flags ✅ COMPLETE
- Feature flags service created
- Middleware integrated into server
- `/api/feature-flags` endpoint
- Flags for all major features
- Runtime enable/disable support

---

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Start the Server

```bash
cd server
node server.js
```

Server will run on `http://localhost:5001`

### 3. Start the Client

```bash
cd client
npm start
```

Client will run on `http://localhost:3000`

**IMPORTANT:** If you change `.env` files, you MUST restart the React dev server for changes to take effect.

### 4. Verify Setup

Visit:
- Frontend: http://localhost:3000
- API Health: http://localhost:5001/api/health
- Feature Flags: http://localhost:5001/api/feature-flags

---

## 🔑 Key Features

### Location-Based Discovery
1. Click "Use My Location" or enter a city manually
2. Adjust radius slider (1-50 miles)
3. Businesses auto-filter by distance
4. Distance shown on each card

### High-Contrast Mode
- Click the 🎨 button in navbar
- Toggles high-contrast accessibility mode
- Persists in localStorage

### Clickable Delivery Badges
- Hover over badges to see highlight
- Click to open delivery service (external link)
- Opens in new tab

### External Business Integration
- Toggle "Include partner picks" checkbox
- Blends Yelp/Google-style external businesses
- Marked with "Partner" badge

---

## 📁 Project Structure

```
byte-sized-business-boost/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SafeImage.js        # Image with fallback
│   │   │   ├── LocationPicker.js   # Location selector ✨ NEW
│   │   │   ├── Navbar.js           # Nav with theme toggles
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── ThemeContext.js     # Dark + high-contrast ✨ UPDATED
│   │   │   ├── BusinessContext.js  # Location state ✨ UPDATED
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Main page ✨ UPDATED
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── images.js           # Image helpers
│   │   │   └── api.js
│   │   └── index.css               # Global styles ✨ UPDATED
│   └── .env                        # API URL ✨ FIXED
│
├── server/                         # Express backend
│   ├── database/
│   │   ├── init.js                # Schema
│   │   ├── business_boost.db      # SQLite DB ✨ UPDATED
│   │   └── migrations/
│   │       └── 001_add_location_columns.js  # ✨ NEW
│   ├── routes/
│   │   ├── businesses.js          # Location queries ✨ UPDATED
│   │   ├── featureFlags.js        # ✨ NEW
│   │   └── ...
│   ├── services/
│   │   ├── geocoding.js           # ✨ NEW
│   │   ├── featureFlags.js        # ✨ NEW
│   │   ├── deliveryMeta.js        # Delivery links
│   │   └── externalBusinesses.js  # Partner data
│   ├── scripts/
│   │   └── geocode-businesses.js  # ✨ NEW
│   └── server.js                  # Main server ✨ UPDATED
│
├── IMPLEMENTATION_PROGRESS.md      # ✨ NEW - Detailed progress
└── DEPLOYMENT_GUIDE.md             # ✨ NEW - This file
```

---

## 🗄️ Database Changes

### New Columns (businesses table)
- `latitude` REAL
- `longitude` REAL
- `city` TEXT
- `state` TEXT
- `zip_code` TEXT
- `is_external` INTEGER (0/1)
- `external_source` TEXT
- `external_id` TEXT
- `delivery_options` TEXT (JSON)

### To Re-run Migration
```bash
cd server
node database/migrations/001_add_location_columns.js
```

### To Re-geocode Businesses
```bash
cd server
node scripts/geocode-businesses.js
```
**Note:** Respects Nominatim rate limits (1 request/second)

---

## 🎛️ Feature Flags

Feature flags are defined in `server/services/featureFlags.js`:

| Flag | Status | Purpose |
|------|--------|---------|
| `external_sourcing` | ✅ Enabled | Show partner businesses |
| `scraping_enabled` | ⏸️ Disabled | Web scraping (safety) |
| `business_pairing` | ✅ Enabled | Pair nearby businesses |
| `random_discovery` | ✅ Enabled | Discovery feature |
| `community_goals` | ✅ Enabled | Community challenges |
| `ai_recommendations` | ⏸️ Disabled | ML recommendations |
| `owner_responses` | ✅ Enabled | Business owner replies |
| `advanced_analytics` | ✅ Enabled | Enhanced analytics |
| `image_proxy` | ✅ Enabled | Proxy images |
| `geocoding` | ✅ Enabled | Location services |

### To Toggle Flags at Runtime:
```javascript
const { enable, disable } = require('./services/featureFlags');
enable('ai_recommendations');
disable('scraping_enabled');
```

---

## 🌐 API Endpoints

### New Endpoints
- `GET /api/feature-flags` - Get all feature flags
- `GET /api/businesses?lat=LAT&lng=LNG&radius=MILES` - Location filtering

### Updated Endpoints
- `GET /api/businesses` - Now supports location parameters
- All responses include `distance` field when filtering by location

---

## 🎨 Accessibility Features

### High-Contrast Mode
- Press 🎨 button in navbar
- Forces black background, white text
- Thick borders on all elements
- Enhanced button contrast
- Underlined links
- Persists across sessions

### Keyboard Navigation
- All interactive elements focusable
- Focus visible indicators
- Skip to main content link
- Semantic HTML structure

### Screen Reader Support
- ARIA labels on all buttons
- Alt text on images
- Role attributes
- Descriptive labels

---

## 🧪 Testing the Implementation

### 1. Test Location Picker
```
1. Visit http://localhost:3000
2. Click "Use My Location" (allow browser permission)
3. Verify businesses filter by distance
4. Change radius to 3 miles
5. Verify list updates
6. Click "Enter City"
7. Type "Seattle, WA"
8. Verify location changes
```

### 2. Test High-Contrast Mode
```
1. Click 🎨 button in navbar
2. Verify dark background, white text
3. Verify borders are visible
4. Refresh page
5. Verify mode persists
```

### 3. Test Delivery Badges
```
1. Find a Food business with delivery options
2. Hover over "Uber Eats" badge
3. Verify color changes to blue
4. Click badge
5. Verify opens Uber Eats in new tab
```

### 4. Test External Businesses
```
1. Toggle "Include partner picks" checkbox
2. Verify additional businesses appear
3. Look for "Partner" label
4. Verify they show in results
```

### 5. Test Feature Flags
```bash
curl http://localhost:5000/api/feature-flags
```
Should return JSON with all flags.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Businesses Not Showing
1. Check client .env points to `http://localhost:5000/api`
2. Verify server is running
3. Check browser console for errors
4. Verify database has geocoded businesses

### Geocoding Failed
- One business (Una Mae's) may fail
- Manually add coordinates if needed:
```sql
UPDATE businesses
SET latitude = 41.9107, longitude = -87.6747
WHERE name = "Una Mae's";
```

### Images Not Loading
1. Verify proxy route is working: `curl http://localhost:5000/api/proxy/image?url=https://via.placeholder.com/300`
2. Check browser console for CORS errors
3. Ensure `image_proxy` feature flag is enabled

---

## 📊 Next Steps (Remaining Features)

See [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) for complete roadmap.

### High Priority
1. **Business Pairing System** - Pair compatible businesses within 0.5 mi
2. **Random Discovery** - Full-screen discovery feature
3. **Community Goals** - Monthly challenges

### Medium Priority
4. **AI Recommendations** - Personalized suggestions
5. **Owner Responses** - Business owner engagement
6. **Advanced Analytics** - Enhanced dashboards

### Low Priority
7. **Telemetry** - Monitoring & metrics
8. **Tests** - Comprehensive test suite
9. **Visual Enhancements** - Advanced animations

---

## 📝 Environment Variables

### Server (.env) - Optional
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=fbla-business-boost-secret-key-2025-competition
```

### Client (.env) - Required
```env
REACT_APP_API_URL=http://localhost:5001/api
```

**IMPORTANT:** React requires a full restart to pick up `.env` changes. Refreshing the browser is not enough!

---

## 🚢 Production Deployment

### Before Deploying:
1. Set `NODE_ENV=production`
2. Build React app: `cd client && npm run build`
3. Serve static files from Express
4. Use proper geocoding API key (not Nominatim)
5. Add rate limiting middleware
6. Enable HTTPS
7. Set up image CDN
8. Configure database backups
9. Add logging service
10. Set up monitoring

### Recommended Services:
- **Hosting**: Railway, Heroku, or DigitalOcean
- **Database**: Keep SQLite or migrate to PostgreSQL
- **Images**: Cloudinary or AWS S3
- **Monitoring**: Sentry or LogRocket
- **Analytics**: Plausible or Umami

---

## 📞 Support

For issues or questions:
1. Check [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md)
2. Review browser console errors
3. Check server logs
4. Verify database integrity

---

## 🎉 Success Criteria

Your implementation is working if:
- ✅ Server starts on port 5000
- ✅ Client starts on port 3000
- ✅ Location picker changes business results
- ✅ Distance shows on business cards
- ✅ High-contrast mode toggles properly
- ✅ Delivery badges are clickable
- ✅ Images load via proxy
- ✅ Feature flags endpoint returns data

**All of the above should now be working! 🎊**

---

*Last updated: 2026-01-12*
*Phase 0-2 + Feature Flags Complete*
