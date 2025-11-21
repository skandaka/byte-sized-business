# Byte-Sized Business Boost

**FBLA Coding & Programming 2025-2026 Competition Project**

> A comprehensive web application helping users discover and support small, local businesses

## 🏆 Competition Alignment

This project addresses the FBLA Coding & Programming 2025-2026 topic: **"Byte-Sized Business Boost"** - creating a platform to help users discover and support small, local businesses through an intuitive, feature-rich web application.

## 🎯 Project Overview

Byte-Sized Business Boost is a standalone web application that enables users to:
- Browse and discover local businesses across multiple categories
- Read and write reviews with ratings
- Save favorite businesses for quick access
- Claim exclusive deals and coupons
- View analytics and insights about local businesses
- Export data for personal use

## 🛠 Technology Stack

### Frontend
- **React 18** - Component-based UI architecture enables code reusability and maintainable development. The virtual DOM provides efficient re-rendering when reviews and ratings update in real-time, crucial for our interactive features.

- **React Router 6** - Client-side routing provides seamless navigation without page reloads, creating a smooth single-page application experience.

### Backend
- **Node.js** - Non-blocking I/O architecture handles concurrent user requests efficiently, essential for real-time review submissions and deal claims.

- **Express.js** - Minimal and flexible web framework provides RESTful API structure with middleware-based request processing, following industry best practices.

### Database
- **SQLite** - Zero-configuration embedded database ensures true standalone capability. No external database server required, making the application portable and perfect for demonstration purposes at competition.

### Additional Libraries
- **Recharts** - Declarative charting library for analytics dashboard visualizations
- **jsPDF** - Client-side PDF generation for data exports
- **PapaParse** - CSV parsing and generation for favorites export
- **bcryptjs** - Secure password hashing (10 rounds of salting)
- **jsonwebtoken** - JWT-based authentication with 7-day token expiration

## ✨ Features

### Required Features (All Implemented)

#### 1. Category Sorting ✅
- 6 categories: Food, Retail, Services, Entertainment, Health, Other
- Visual category cards with business counts
- Multi-select filtering capability
- Real-time filtering with instant results

#### 2. Reviews & Ratings System ✅
- Interactive 1-5 star rating component
- Text reviews with 500-character limit
- Username and timestamp display
- Average rating calculation
- Total review count per business
- Real-time updates on submission

#### 3. Sort by Reviews/Ratings ✅
- Dropdown with multiple sort options:
  - Highest Rated
  - Most Reviews
  - Lowest Rated
  - Most Recent
  - Alphabetical (A-Z)
- Visual indicator showing current sort method
- Instant re-sorting on selection

#### 4. Favorites/Bookmarking ✅
- Heart icon toggle on business cards
- Persistence to both localStorage AND database
- Dedicated "My Favorites" page
- One-click removal
- Empty state messaging

#### 5. Deals & Coupons ✅
- Deal cards with title, description, code, expiration
- Live countdown timer (updates every second)
- Filter deals by category
- Visual distinction for expiring soon (< 7 days)
- Expired deals grayed out/hidden
- "Claim Deal" requires verification

#### 6. Bot Prevention Verification ✅
- Math CAPTCHA verification
- Required before: Review submission, Deal claims
- Success/failure messaging
- Verification attempt logging to database
- Prevents automated abuse

### Advanced Features

#### 7. Smart Search 🔍
- Search bar with real-time filtering
- Debounced input (300ms) to reduce API calls
- Searches across: name, category, description
- Autocomplete suggestions
- "No results" state with helpful message

#### 8. Advanced Filtering 🎛
- Sidebar filter panel with:
  - Category multi-select checkboxes
  - Rating filter (4+ stars, 3+ stars, All)
  - "Clear all filters" button
- Filter count indicator
- Persistent filter state

#### 9. User Authentication 🔐
- Sign up form (username, email, password)
- Login form with JWT session management
- Password requirements enforced:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
- User profile page
- Secure password hashing (bcrypt with 10 rounds)

#### 10. Analytics Dashboard 📊
- Pie chart: Business distribution by category
- Bar chart: Top 10 highest-rated businesses
- Line chart: Reviews over time (30 days)
- Statistics cards:
  - Total businesses
  - Average rating across platform
  - Total reviews
  - Total users
- Built with Recharts library

#### 11. Data Export 📥
- Export favorites as CSV
- Export review history
- Generate business reports
- PDF generation with jsPDF
- CSV generation with PapaParse
- Download buttons with format selection

#### 12. Responsive Design 📱
- Mobile-first approach
- Breakpoints:
  - 640px (mobile)
  - 768px (tablet)
  - 1024px (desktop)
- Hamburger menu for mobile
- Touch-friendly buttons (44x44px minimum)
- Tested across devices

#### 13. Dark Mode 🌙
- Toggle switch in navbar
- Persists to localStorage
- Smooth CSS transitions
- WCAG AA contrast compliance
- All colors tested for accessibility

## 🏗 Architecture

### Project Structure
```
byte-sized-business-boost/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Route pages
│   │   ├── contexts/      # React Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                 # Express backend
│   ├── database/
│   │   ├── init.js       # Database schema
│   │   ├── seed.js       # Demo data
│   │   └── business_boost.db
│   ├── routes/
│   │   ├── businesses.js
│   │   ├── reviews.js
│   │   ├── auth.js
│   │   ├── favorites.js
│   │   ├── deals.js
│   │   └── analytics.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

### Database Schema

#### businesses
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- category (TEXT CHECK: Food|Retail|Services|Entertainment|Health|Other)
- description (TEXT NOT NULL)
- address (TEXT NOT NULL)
- phone (TEXT NOT NULL)
- hours (TEXT JSON)
- email (TEXT)
- website (TEXT)
- image_url (TEXT)
- created_at (DATETIME)

#### users
- id (TEXT PRIMARY KEY)
- username (TEXT UNIQUE NOT NULL)
- email (TEXT UNIQUE NOT NULL)
- password_hash (TEXT NOT NULL)
- is_admin (INTEGER DEFAULT 0)
- is_verified (INTEGER DEFAULT 1)
- created_at (DATETIME)

#### reviews
- id (TEXT PRIMARY KEY)
- business_id (TEXT FK → businesses.id)
- user_id (TEXT FK → users.id)
- username (TEXT NOT NULL)
- rating (INTEGER CHECK 1-5)
- comment (TEXT CHECK length ≤ 500)
- helpful_count (INTEGER DEFAULT 0)
- created_at (DATETIME)

#### favorites
- id (TEXT PRIMARY KEY)
- user_id (TEXT FK → users.id)
- business_id (TEXT FK → businesses.id)
- created_at (DATETIME)
- UNIQUE(user_id, business_id)

#### deals
- id (TEXT PRIMARY KEY)
- business_id (TEXT FK → businesses.id)
- title (TEXT NOT NULL)
- description (TEXT NOT NULL)
- discount_code (TEXT)
- expiration_date (DATETIME NOT NULL)
- terms (TEXT)
- is_active (INTEGER DEFAULT 1)
- created_at (DATETIME)

#### verification_logs
- id (TEXT PRIMARY KEY)
- user_id (TEXT)
- verification_type (TEXT)
- success (INTEGER)
- ip_address (TEXT)
- created_at (DATETIME)

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm installed
- Git (optional, for cloning)

### Step-by-Step Installation

1. **Extract or Clone the Project**
   ```bash
   cd byte-sized-business-boost
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Initialize Database**
   ```bash
   npm run init-db
   ```

4. **Seed Demo Data**
   ```bash
   npm run seed
   ```

5. **Start Backend Server**
   ```bash
   npm start
   ```
   Server runs on http://localhost:5000

6. **Install Client Dependencies** (in new terminal)
   ```bash
   cd ../client
   npm install
   ```

7. **Start Frontend Application**
   ```bash
   npm start
   ```
   Application opens on http://localhost:3000

## 🎮 Usage Guide

### Demo Accounts

**Regular User:**
- Email: user@demo.com
- Password: Demo123!
- Has 5 favorites and 8 reviews already created

**Admin User:**
- Email: admin@demo.com
- Password: Admin123!
- Can add businesses and manage deals

**New User:**
- Email: test@demo.com
- Password: Test123!
- Clean slate for demonstration

### Key User Flows

1. **Browse Businesses**
   - Homepage displays all businesses
   - Click category chips to filter
   - Use search bar for specific businesses
   - Apply filters in sidebar

2. **View Business Details**
   - Click any business card
   - View full details, hours, contact info
   - Read reviews and ratings
   - See available deals

3. **Write a Review**
   - Must be logged in
   - Click "Write Review" button
   - Select 1-5 stars
   - Enter review text (max 500 chars)
   - Complete verification CAPTCHA
   - Submit and see immediate update

4. **Save Favorites**
   - Click heart icon on business card
   - View all favorites in "My Favorites" page
   - Click heart again to remove

5. **Claim Deals**
   - Browse deals page
   - Filter by category
   - Click "Claim Deal" button
   - Complete verification
   - Receive discount code

6. **View Analytics**
   - Navigate to Analytics page
   - View charts and statistics
   - Explore category distribution
   - See trending businesses

7. **Export Data**
   - Go to Profile page
   - Click "Export Favorites (CSV)"
   - Click "Export Review History (PDF)"
   - Files download automatically

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Businesses
- `GET /businesses` - Get all businesses (supports filtering)
  - Query params: `category`, `minRating`, `search`, `sort`
- `GET /businesses/:id` - Get business by ID
- `POST /businesses` - Create business (admin only)

#### Reviews
- `GET /reviews/:businessId` - Get reviews for business
- `POST /reviews` - Create review (authenticated)
- `DELETE /reviews/:id` - Delete review (owner only)
- `PUT /reviews/:id/helpful` - Increment helpful count
- `GET /reviews/user/:userId` - Get user's reviews

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (authenticated)
- `POST /auth/logout` - Logout user

#### Favorites
- `GET /favorites/:userId` - Get user's favorites
- `POST /favorites` - Add to favorites
- `DELETE /favorites/:userId/:businessId` - Remove favorite
- `GET /favorites/:userId/check/:businessId` - Check if favorited
- `GET /favorites/:userId/export` - Export as CSV

#### Deals
- `GET /deals` - Get all active deals
  - Query params: `category`, `active`
- `GET /deals/business/:businessId` - Get business deals
- `GET /deals/:id` - Get deal by ID
- `POST /deals` - Create deal (admin only)
- `POST /deals/:id/claim` - Claim deal (requires verification)

#### Analytics
- `GET /analytics/overview` - Platform statistics
- `GET /analytics/top-rated` - Top-rated businesses
- `GET /analytics/trending` - Trending businesses
- `GET /analytics/reviews-over-time` - Review trends
- `GET /analytics/user/:userId` - User statistics
- `GET /analytics/business/:businessId` - Business analytics

## 🎨 Code Quality

### Language Justification
We chose React because its component-based architecture enables code reusability and maintainable UI development. The virtual DOM provides efficient re-rendering when reviews and ratings update in real-time. Node.js with Express offers non-blocking I/O for handling concurrent user requests. SQLite provides zero-configuration data persistence, making the application truly standalone and portable for demonstration purposes.

### Best Practices Implemented
- ✅ Async/await instead of callback chains
- ✅ Error boundaries for graceful error handling
- ✅ Environment variables for configuration
- ✅ Loading states for all async operations
- ✅ Single responsibility principle
- ✅ DRY principle (no code duplication)
- ✅ Consistent naming conventions
- ✅ Input sanitization prevents XSS attacks
- ✅ SQL injection prevention with parameterized queries
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token-based authentication

### Code Comments
- All functions have JSDoc comments
- Complex logic includes inline explanations
- Component props documented
- API routes include request/response examples

## ♿ Accessibility Features

- ✅ Semantic HTML5 (`<nav>`, `<main>`, `<article>`, `<section>`)
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation (Tab order, Enter/Space, Escape)
- ✅ Focus indicators (visible blue ring)
- ✅ Alt text on all images
- ✅ Contrast ratio: 4.5:1 minimum (WCAG AA compliant)
- ✅ Form labels for every input
- ✅ Error announcements with aria-live
- ✅ Skip to main content link

## 🧪 Testing

### Manual Testing Checklist
- [ ] All 30 businesses display correctly
- [ ] Category filtering works
- [ ] Search finds correct results
- [ ] Reviews can be created and display
- [ ] Ratings calculate correctly
- [ ] Favorites persist across sessions
- [ ] Deals show correct expiration countdown
- [ ] Verification blocks bot submissions
- [ ] Authentication works (signup, login, logout)
- [ ] Analytics charts render data
- [ ] Data exports download successfully
- [ ] Dark mode toggles properly
- [ ] Mobile responsive on all pages
- [ ] Keyboard navigation functional

## 📝 Known Limitations

1. **Image Hosting**: Uses Unsplash URLs - in production, would use CDN or local storage
2. **Email Verification**: Currently bypassed - would implement SendGrid in production
3. **Rate Limiting**: Not implemented - would add express-rate-limit for production

## 🚀 Future Enhancements

1. **Geolocation**: Show nearby businesses based on user location
2. **Business Claims**: Allow business owners to claim and manage listings
3. **Social Sharing**: Share businesses and deals on social media
4. **Push Notifications**: Alert users about new deals from favorited businesses
5. **Advanced Analytics**: Business comparison tool, market insights

## 📄 License

MIT License - Created for FBLA Coding & Programming Competition 2025-2026

## 👥 Contact

For questions about this project, please contact your FBLA chapter advisor.

---

**Competition Ready**: This application demonstrates mastery of full-stack development, follows best practices, and showcases all required and advanced features for the FBLA Coding & Programming 2025-2026 competition.

**Good luck at Nationals! 🏆**
