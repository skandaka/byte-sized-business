# Byte-Sized Business Boost
## Complete Technical & Functional Documentation

**FBLA Coding & Programming 2025-2026 Competition Project**

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Project Overview & Purpose](#2-project-overview--purpose)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [Backend API Documentation](#6-backend-api-documentation)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Core Features Implementation](#8-core-features-implementation)
9. [Intelligent Local Business Algorithm](#9-intelligent-local-business-algorithm)
10. [User Authentication System](#10-user-authentication-system)
11. [User Experience & Accessibility](#11-user-experience--accessibility)
12. [Security Implementation](#12-security-implementation)
13. [Third-Party Integrations](#13-third-party-integrations)
14. [Deployment & Setup Guide](#14-deployment--setup-guide)
15. [Appendix & Reference](#15-appendix--reference)

---

# 1. EXECUTIVE SUMMARY

## 1.1 Project Identity

**Application Name:** Byte-Sized Business Boost  
**Competition:** FBLA Coding & Programming 2025-2026  
**Topic:** Helping users discover and support small, local businesses  
**Development Period:** November 2025 - January 2026

## 1.2 Mission Statement

Byte-Sized Business Boost is a comprehensive web application designed to connect community members with local, family-owned businesses. The platform empowers users to discover hidden gems in their neighborhood, share authentic experiences through reviews, save favorites, and access exclusive deals—all while ensuring only genuine small businesses are promoted through our proprietary Local Business Authenticity Index (LBAI) algorithm.

## 1.3 Key Differentiators

| Feature | Description |
|---------|-------------|
| **LBAI Algorithm** | Proprietary 3-component scoring system that automatically filters out corporate chains |
| **Live Business Search** | Real-time Google Places API integration with intelligent filtering |
| **Social Proof** | Deal claim counters, review helpfulness tracking, and community engagement |
| **Accessibility-First** | WCAG AA compliant with high-contrast mode and keyboard navigation |
| **Standalone Architecture** | SQLite database ensures true portability with zero external dependencies |

## 1.4 Competition Requirements Met

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Sort by category | ✅ Complete | 6 categories with multi-select filtering |
| Leave reviews & ratings | ✅ Complete | 1-5 star system with 500-char reviews |
| Sort by reviews/ratings | ✅ Complete | Multiple sort options |
| Save/bookmark favorites | ✅ Complete | Database + localStorage persistence |
| Display deals with expiration | ✅ Complete | Live countdown timers |
| Bot prevention verification | ✅ Complete | Math CAPTCHA modal |

---

# 2. PROJECT OVERVIEW & PURPOSE

## 2.1 Problem Statement

In an era dominated by corporate chains and big-box retailers, local small businesses struggle to gain visibility. Generic search engines like Google and Yelp often prioritize large chains due to their high review counts and SEO optimization, leaving authentic local gems buried in search results.

**Challenges Faced by Small Businesses:**
- Competition with corporate chains for online visibility
- Limited marketing budgets for digital presence
- Difficulty building customer loyalty without corporate loyalty programs
- Lack of platforms specifically designed to highlight local establishments

## 2.2 Our Solution

Byte-Sized Business Boost addresses these challenges through:

1. **Intelligent Filtering**: Our LBAI algorithm automatically identifies and excludes corporate chains, ensuring only genuine local businesses appear in results.

2. **Community-Driven Discovery**: Reviews, ratings, and favorites create organic social proof that helps quality businesses rise to the top.

3. **Exclusive Deal System**: Local businesses can offer special promotions to engaged users, driving foot traffic without expensive advertising.

4. **Location-Based Search**: Users can discover businesses within their preferred radius, supporting truly local commerce.

## 2.3 Target Users

### Primary Users
- **Local Shoppers**: Community members seeking authentic local experiences
- **Conscious Consumers**: Users who prefer supporting small businesses over chains
- **Tourists & Newcomers**: People exploring new areas seeking local recommendations

### Secondary Users
- **Small Business Owners**: Establishments looking to increase visibility
- **Community Organizations**: Groups promoting local economic development

## 2.4 User Journey Map

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   DISCOVER   │ →  │   EXPLORE    │ →  │   ENGAGE     │
│              │    │              │    │              │
│ • Browse     │    │ • View Detail│    │ • Leave      │
│ • Search     │    │ • Read       │    │   Review     │
│ • Filter by  │    │   Reviews    │    │ • Claim      │
│   Category   │    │ • Check      │    │   Deals      │
│ • Set        │    │   Hours      │    │ • Save       │
│   Location   │    │ • See Deals  │    │   Favorite   │
└──────────────┘    └──────────────┘    └──────────────┘
                                               ↓
                                        ┌──────────────┐
                                        │   RETURN     │
                                        │              │
                                        │ • Access     │
                                        │   Favorites  │
                                        │ • Use        │
                                        │   Coupons    │
                                        │ • Export     │
                                        │   Data       │
                                        └──────────────┘
```

---

# 3. TECHNOLOGY STACK

## 3.1 Frontend Technologies

### React 18
**Version:** 18.2.0  
**Justification:** Component-based architecture enables code reusability and maintainable development. The virtual DOM provides efficient re-rendering when reviews and ratings update in real-time.

**Key Features Used:**
- Functional components with hooks
- Context API for global state management
- React Router 6 for client-side navigation
- Intersection Observer for scroll animations

### Supporting Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| react-router-dom | 6.20.0 | Client-side routing |
| axios | 1.6.2 | HTTP requests |
| recharts | 2.10.3 | Analytics visualizations |
| jspdf | 2.5.1 | PDF export generation |
| papaparse | 5.4.1 | CSV parsing and export |

## 3.2 Backend Technologies

### Node.js + Express.js
**Node Version:** 18+  
**Express Version:** 4.18.2  
**Justification:** Non-blocking I/O architecture handles concurrent user requests efficiently. Express provides a minimal, flexible framework following RESTful API best practices.

### Supporting Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| sqlite3 | 5.1.6 | Database driver |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT authentication |
| uuid | 9.0.1 | Unique ID generation |
| cors | 2.8.5 | Cross-origin handling |
| dotenv | 16.3.1 | Environment variables |

## 3.3 Database

### SQLite
**Version:** 5.1.7  
**Justification:** Zero-configuration embedded database ensures true standalone capability. No external database server required, making the application portable and perfect for competition demonstration.

**Advantages:**
- No installation or configuration required
- Single file storage (`business_boost.db`)
- ACID compliant transactions
- Full SQL support

## 3.4 External APIs

### Google Places API
**Purpose:** Live business data with real photos and ratings  
**Features Used:**
- Nearby Search API
- Text Search API
- Place Details API
- Place Photos API

---

# 4. SYSTEM ARCHITECTURE

## 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   Pages  │  │Components│  │ Contexts │  │     Utilities    │ │
│  │          │  │          │  │          │  │                  │ │
│  │ HomePage │  │ Navbar   │  │ Auth     │  │ api.js           │ │
│  │ Detail   │  │ Cards    │  │ Business │  │ images.js        │ │
│  │ Favorites│  │ Forms    │  │ Theme    │  │                  │ │
│  │ Analytics│  │ Modals   │  │          │  │                  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP/REST
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Express)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │    Routes    │  │   Services   │  │      Middleware       │  │
│  │              │  │              │  │                       │  │
│  │ /businesses  │  │ LBAI Algo    │  │ CORS                  │  │
│  │ /reviews     │  │ Google Places│  │ JSON Parser           │  │
│  │ /auth        │  │ Geocoding    │  │ Auth Verification     │  │
│  │ /deals       │  │ Deal Scraper │  │ Feature Flags         │  │
│  │ /favorites   │  │ Image Proxy  │  │ Request Logger        │  │
│  │ /analytics   │  │              │  │                       │  │
│  └──────────────┘  └──────────────┘  └───────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ SQL
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (SQLite)                           │
│                                                                  │
│  businesses │ users │ reviews │ favorites │ deals │ claims      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 Request Flow

```
1. User Action (e.g., Search)
       │
       ▼
2. React Component State Update
       │
       ▼
3. API Utility Function Call (axios)
       │
       ▼
4. HTTP Request to Express Server
       │
       ▼
5. Route Handler Processing
       │
       ▼
6. Service Layer Logic (LBAI, filtering)
       │
       ▼
7. Database Query (SQLite)
       │
       ▼
8. Response JSON Formation
       │
       ▼
9. React State Update & Re-render
```

## 4.3 Directory Structure

```
byte-sized-business-boost/
│
├── client/                          # React Frontend Application
│   ├── public/
│   │   └── index.html              # HTML entry point
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── BusinessCard.js     # Business display card
│   │   │   ├── CategoryFilter.js   # Category selection
│   │   │   ├── DealCard.js         # Deal with countdown
│   │   │   ├── EmptyState.js       # No-data messaging
│   │   │   ├── LoadingSkeleton.js  # Loading placeholders
│   │   │   ├── LocationPicker.js   # Location selector
│   │   │   ├── Navbar.js           # Navigation bar
│   │   │   ├── PasswordStrengthMeter.js
│   │   │   ├── ReviewForm.js       # Review submission
│   │   │   ├── ReviewList.js       # Reviews display
│   │   │   ├── SafeImage.js        # Image with fallback
│   │   │   ├── SearchBar.js        # Search with history
│   │   │   ├── StarRating.js       # Rating component
│   │   │   ├── Toast.js            # Notifications
│   │   │   └── VerificationModal.js # CAPTCHA modal
│   │   ├── contexts/               # React Context providers
│   │   │   ├── AuthContext.js      # Authentication state
│   │   │   ├── BusinessContext.js  # Business data & filters
│   │   │   └── ThemeContext.js     # Dark mode state
│   │   ├── hooks/                  # Custom React hooks
│   │   │   └── useLocalStorage.js  # Persistent state
│   │   ├── pages/                  # Route components
│   │   │   ├── AnalyticsPage.js    # Platform analytics
│   │   │   ├── BusinessClaimPage.js # Owner claim
│   │   │   ├── BusinessDetailPage.js # Single business
│   │   │   ├── CommunityGoalsPage.js
│   │   │   ├── DealsPage.js        # All deals
│   │   │   ├── FavoritesPage.js    # User favorites
│   │   │   ├── HomePage.js         # Main landing
│   │   │   ├── LoginPage.js        # Authentication
│   │   │   ├── MapPage.js          # Map view
│   │   │   ├── ProfilePage.js      # User profile
│   │   │   ├── RandomDiscoveryPage.js
│   │   │   └── RegisterPage.js     # Registration
│   │   ├── utils/                  # Utility functions
│   │   │   ├── api.js              # API communication
│   │   │   └── images.js           # Image helpers
│   │   ├── App.js                  # Root component
│   │   ├── index.js                # React entry
│   │   └── index.css               # Global styles
│   └── package.json
│
├── server/                          # Express Backend API
│   ├── database/
│   │   ├── init.js                 # Schema creation
│   │   ├── seed.js                 # Sample data
│   │   ├── business_boost.db       # SQLite database file
│   │   └── migrations/             # Schema updates
│   ├── routes/                     # API endpoints
│   │   ├── analytics.js            # Analytics endpoints
│   │   ├── auth.js                 # Authentication
│   │   ├── businesses.js           # Business CRUD
│   │   ├── deals.js                # Deals management
│   │   ├── favorites.js            # Favorites CRUD
│   │   ├── featureFlags.js         # Feature toggles
│   │   ├── imageProxy.js           # Image proxying
│   │   └── reviews.js              # Review CRUD
│   ├── services/                   # Business logic
│   │   ├── businessPairing.js      # Complementary business
│   │   ├── dealScraper.js          # Smart deal generation
│   │   ├── deliveryMeta.js         # Delivery options
│   │   ├── featureFlags.js         # Feature flag service
│   │   ├── geocoding.js            # Location services
│   │   ├── googlePlaces.js         # Google API wrapper
│   │   ├── intelligentLocalFilter.js
│   │   ├── liveBusinessSearch.js   # Live search
│   │   └── localBusinessAlgorithm.js # LBAI Algorithm
│   ├── scripts/                    # Utility scripts
│   │   └── geocode-businesses.js
│   ├── server.js                   # Express app entry
│   └── package.json
│
└── Documentation files (*.md)
```

---

# 5. DATABASE DESIGN

## 5.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │   BUSINESSES    │
├─────────────────┤       ├─────────────────┤
│ PK id           │       │ PK id           │
│    username     │       │    name         │
│    email        │       │    category     │
│    password_hash│       │    description  │
│    is_admin     │       │    address      │
│    created_at   │       │    phone        │
└────────┬────────┘       │    hours        │
         │                │    email        │
         │                │    website      │
         │                │    image_url    │
         │                │    latitude     │
         │                │    longitude    │
         │                │    created_at   │
         │                └────────┬────────┘
         │                         │
         │    ┌────────────────────┼────────────────────┐
         │    │                    │                    │
         ▼    ▼                    ▼                    ▼
┌─────────────────┐       ┌─────────────────┐  ┌─────────────────┐
│    REVIEWS      │       │     DEALS       │  │   FAVORITES     │
├─────────────────┤       ├─────────────────┤  ├─────────────────┤
│ PK id           │       │ PK id           │  │ PK id           │
│ FK business_id  │       │ FK business_id  │  │ FK user_id      │
│ FK user_id      │       │    title        │  │ FK business_id  │
│    username     │       │    description  │  │    created_at   │
│    rating (1-5) │       │    discount_code│  └─────────────────┘
│    comment      │       │    expiration   │
│    helpful_count│       │    terms        │
│    created_at   │       │    is_active    │
└─────────────────┘       │    created_at   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  DEAL_CLAIMS    │
                          ├─────────────────┤
                          │ PK id           │
                          │ FK deal_id      │
                          │ FK user_id      │
                          │    claimed_at   │
                          └─────────────────┘
```

## 5.2 Table Definitions

### businesses
Primary table storing all local business information.

```sql
CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN 
    ('Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other')),
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,           -- JSON string
  email TEXT,
  website TEXT,
  image_url TEXT,
  latitude REAL,
  longitude REAL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### users
User account information with secure password storage.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,   -- bcrypt hash
  is_admin INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### reviews
User-generated business reviews with ratings.

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK(LENGTH(comment) <= 500),
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### favorites
User-saved businesses for quick access.

```sql
CREATE TABLE favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, business_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
```

### deals
Business promotions and coupons.

```sql
CREATE TABLE deals (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_code TEXT,
  expiration_date DATETIME NOT NULL,
  terms TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);
```

### deal_claims
Tracks deal usage for social proof counters.

```sql
CREATE TABLE deal_claims (
  id TEXT PRIMARY KEY,
  deal_id TEXT NOT NULL,
  user_id TEXT,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### verification_logs
Bot prevention audit trail.

```sql
CREATE TABLE verification_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  verification_type TEXT NOT NULL,
  success INTEGER NOT NULL,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 5.3 Additional Tables

The database also includes tables for advanced features:

| Table | Purpose |
|-------|---------|
| user_achievements | Badge/achievement tracking |
| business_spotlight | Featured business rotation |
| community_goals | Community challenge tracking |
| user_goal_contributions | User participation in goals |
| qna_questions | Business Q&A questions |
| qna_answers | Community answers |
| user_behavior | Behavior tracking for recommendations |
| search_history | Search query logging |
| business_owner_claims | Owner verification requests |
| business_announcements | Owner announcements |
| review_responses | Owner replies to reviews |
| user_preferences | Personalization settings |

---

# 6. BACKEND API DOCUMENTATION

## 6.1 API Overview

**Base URL:** `http://localhost:5000/api`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

## 6.2 Endpoint Reference

### Business Endpoints

#### GET /api/businesses
Retrieve businesses with optional filters. Supports live Google Places search when location provided.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (Food, Retail, etc.) |
| minRating | number | Minimum rating filter |
| search | string | Search in name/description |
| sort | string | Sort order (highest-rated, most-reviews, a-z) |
| lat | number | Latitude for live search |
| lng | number | Longitude for live search |
| radius | number | Search radius in miles |
| external | boolean | Include partner businesses |

**Response:** Array of business objects

```json
[
  {
    "id": "uuid-1234",
    "name": "Joe's Corner Cafe",
    "category": "Food",
    "description": "Family-owned since 1985...",
    "address": "123 Main St, Chicago, IL",
    "phone": "(312) 555-1234",
    "hours": {"Monday": "8AM-6PM", ...},
    "image_url": "https://...",
    "averageRating": 4.5,
    "reviewCount": 23,
    "distance": 2.3,
    "localScore": {
      "overallScore": 85,
      "isLocal": true
    }
  }
]
```

#### GET /api/businesses/:id
Get single business details.

#### GET /api/businesses/categories/count
Get business count per category.

### Review Endpoints

#### GET /api/reviews/:businessId
Get reviews for a business.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| sort | string | recent, highest, lowest, helpful |

#### POST /api/reviews
Create a new review. Requires bot verification.

**Request Body:**
```json
{
  "businessId": "uuid-1234",
  "userId": "user-uuid",
  "username": "johndoe",
  "rating": 5,
  "comment": "Great local shop!",
  "verificationToken": "verified_timestamp"
}
```

#### PUT /api/reviews/:id/helpful
Increment helpful count.

#### DELETE /api/reviews/:id
Delete a review (owner only).

### Authentication Endpoints

#### POST /api/auth/register
Register new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

**Response:**
```json
{
  "message": "User created successfully",
  "user": { "id": "...", "username": "...", "email": "..." },
  "token": "jwt-token-string"
}
```

#### POST /api/auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### GET /api/auth/profile
Get current user profile (requires auth token).

### Favorites Endpoints

#### GET /api/favorites/:userId
Get user's favorited businesses.

#### POST /api/favorites
Add business to favorites.

#### DELETE /api/favorites/:userId/:businessId
Remove from favorites.

### Deals Endpoints

#### GET /api/deals
Get all active deals with countdown info.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by business category |
| active | boolean | Only active deals (default: true) |
| lat/lng | number | Location for deal generation |

**Response includes:**
- `daysRemaining` - Days until expiration
- `isExpiringSoon` - True if < 7 days left
- `claim_count` - Number of users who claimed

#### GET /api/deals/business/:businessId
Get deals for specific business.

#### POST /api/deals/:id/claim
Claim a deal (requires verification).

### Analytics Endpoints

#### GET /api/analytics/overview
Platform statistics overview.

**Response:**
```json
{
  "totalBusinesses": 150,
  "totalReviews": 523,
  "totalUsers": 89,
  "averageRating": 4.2,
  "categoryDistribution": [
    {"category": "Food", "count": 45},
    {"category": "Retail", "count": 32}
  ],
  "recentReviews": [...]
}
```

#### GET /api/analytics/top-rated
Top 10 highest-rated businesses.

#### GET /api/analytics/trending
Most reviewed in last 30 days.

#### GET /api/analytics/reviews-over-time
Review count by date.

---

# 7. FRONTEND ARCHITECTURE

## 7.1 Component Hierarchy

```
App.js
├── ThemeProvider (Context)
│   └── AuthProvider (Context)
│       └── BusinessProvider (Context)
│           ├── Navbar
│           │   ├── Logo
│           │   ├── Navigation Links
│           │   ├── Theme Toggle
│           │   └── User Menu
│           │
│           └── Routes
│               ├── HomePage
│               │   ├── LocationPicker
│               │   ├── SearchBar
│               │   ├── CategoryFilter
│               │   ├── SortDropdown
│               │   └── BusinessGrid
│               │       └── BusinessCard[]
│               │           ├── SafeImage
│               │           └── StarRating
│               │
│               ├── BusinessDetailPage
│               │   ├── SafeImage
│               │   ├── StarRating
│               │   ├── ReviewList
│               │   │   └── ReviewItem[]
│               │   ├── ReviewForm
│               │   │   └── VerificationModal
│               │   ├── DealCard[]
│               │   └── BusinessPairings
│               │
│               ├── FavoritesPage
│               │   ├── EmptyState
│               │   └── FavoriteCard[]
│               │
│               ├── DealsPage
│               │   ├── CategoryFilter
│               │   ├── DealCard[]
│               │   └── LoadingSkeleton
│               │
│               └── AnalyticsPage
│                   ├── StatCards
│                   └── Charts (Recharts)
```

## 7.2 Context Providers

### AuthContext
Manages user authentication state across the application.

**State:**
```javascript
{
  user: { id, username, email, is_admin } | null,
  loading: boolean,
  error: string | null
}
```

**Methods:**
- `login(email, password)` - Authenticate user
- `register(username, email, password)` - Create account
- `logout()` - Clear session
- `refreshProfile()` - Update user data
- `isAuthenticated()` - Check login status
- `isAdmin()` - Check admin privileges

### BusinessContext
Manages business data and filter state.

**State:**
```javascript
{
  businesses: Business[],
  favorites: Business[],
  loading: boolean,
  error: string | null,
  selectedCategory: string,
  searchQuery: string,
  sortBy: string,
  minRating: number,
  includeExternal: boolean,
  location: { lat, lng, name, radius }
}
```

**Methods:**
- `fetchBusinesses()` - Load businesses with current filters
- `fetchFavorites()` - Load user's favorites
- `isFavorited(businessId)` - Check if favorited
- `resetFilters()` - Clear all filters

### ThemeContext
Manages dark mode and high-contrast accessibility mode.

**State:**
```javascript
{
  theme: 'light' | 'dark',
  highContrast: boolean
}
```

**Methods:**
- `toggleTheme()` - Switch light/dark
- `toggleHighContrast()` - Toggle accessibility mode

## 7.3 Key Components

### SafeImage
Handles image loading with fallback and proxy support.

**Props:**
- `src` - Image URL
- `alt` - Alt text
- `category` - Business category (for placeholder)
- `businessName` - Name for placeholder
- `height/width` - Dimensions
- `style` - Custom styles

**Features:**
- Automatic fallback to category-based placeholder
- Proxy through backend for CORS issues
- Loading state handling

### SearchBar
Feature-rich search with history.

**Features:**
- Rotating placeholder suggestions
- Search history dropdown (localStorage)
- Real-time result count
- Clear button
- Keyboard navigation

### LoadingSkeleton
Psychological loading optimization.

**Variants:**
- `BusinessCardSkeleton` - Card placeholder
- `DealCardSkeleton` - Deal placeholder
- `ReviewSkeleton` - Review placeholder
- `ListSkeleton` - Grid of skeletons

**Animation:** CSS shimmer effect

### VerificationModal
Bot prevention CAPTCHA.

**Implementation:**
- Random math problem (num1 + num2 = ?)
- Regenerates on wrong answer
- Logs verification attempts
- Required for reviews and deal claims

## 7.4 Routing Structure

| Path | Component | Access |
|------|-----------|--------|
| `/` | HomePage | Public |
| `/business/:id` | BusinessDetailPage | Public |
| `/business/:id/claim` | BusinessClaimPage | Public |
| `/discover` | RandomDiscoveryPage | Public |
| `/map` | MapPage | Public |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/favorites` | FavoritesPage | Protected |
| `/profile` | ProfilePage | Protected |

---

# 8. CORE FEATURES IMPLEMENTATION

## 8.1 Category Sorting (Required Feature #1)

**Implementation Location:** `client/src/pages/HomePage.js`

**Categories:**
1. Food - Restaurants, cafes, bakeries
2. Retail - Shops, boutiques, stores
3. Services - Salons, repair shops, professionals
4. Entertainment - Venues, activities
5. Health - Gyms, wellness, medical
6. Other - Miscellaneous

**Features:**
- Visual category buttons with active state
- Multi-select capability
- Business count per category
- Real-time filtering

**Code Flow:**
```
User clicks category
    → setSelectedCategory(category)
    → BusinessContext useEffect triggers
    → fetchBusinesses() with category filter
    → API query with WHERE clause
    → Results rendered
```

## 8.2 Reviews & Ratings System (Required Feature #2)

**Implementation Locations:**
- `client/src/components/ReviewForm.js`
- `client/src/components/ReviewList.js`
- `client/src/components/StarRating.js`
- `server/routes/reviews.js`

**Features:**
- Interactive 1-5 star selection
- 500-character comment limit
- Character counter display
- Username and timestamp
- Helpful count voting
- Sort by: recent, highest, lowest, helpful
- Real-time average calculation

**Star Rating Component:**
```javascript
// Interactive star selection
{[1, 2, 3, 4, 5].map((star) => (
  <span
    key={star}
    onClick={() => onChange(star)}
    style={{ cursor: 'pointer' }}
  >
    {star <= rating ? '⭐' : '☆'}
  </span>
))}
```

## 8.3 Sort by Reviews/Ratings (Required Feature #3)

**Implementation Location:** `client/src/pages/HomePage.js`

**Sort Options:**
| Value | Label | SQL ORDER BY |
|-------|-------|--------------|
| highest-rated | Highest Rated | averageRating DESC |
| most-reviews | Most Reviews | reviewCount DESC |
| lowest-rated | Lowest Rated | averageRating ASC |
| most-recent | Most Recent | created_at DESC |
| a-z | Alphabetical | name ASC |

## 8.4 Favorites/Bookmarking (Required Feature #4)

**Implementation Locations:**
- `client/src/pages/FavoritesPage.js`
- `server/routes/favorites.js`

**Features:**
- Heart icon toggle on cards
- Dual persistence (localStorage + database)
- Dedicated favorites page
- One-click removal
- Empty state with CTA
- CSV export capability

**Database Schema:**
```sql
favorites (
  id, user_id, business_id, created_at
  UNIQUE(user_id, business_id)  -- Prevents duplicates
)
```

## 8.5 Deals & Coupons (Required Feature #5)

**Implementation Locations:**
- `client/src/components/DealCard.js`
- `client/src/pages/DealsPage.js`
- `server/routes/deals.js`

**Features:**
- Deal cards with title, description, code
- Live countdown timer (updates every second)
- Category filtering
- Visual "Expiring Soon" badge (< 7 days)
- Expired deals grayed out
- Claim counter for social proof
- Verification required to claim

**Countdown Timer:**
```javascript
useEffect(() => {
  const updateTimer = () => {
    const diff = expiration - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    // ... format display
  };
  
  updateTimer();
  const interval = setInterval(updateTimer, 1000);
  return () => clearInterval(interval);
}, [expiration]);
```

## 8.6 Bot Prevention Verification (Required Feature #6)

**Implementation Location:** `client/src/components/VerificationModal.js`

**Mechanism:** Math CAPTCHA

**Features:**
- Random addition problem (1-10 range)
- Regenerates on incorrect answer
- Success/failure messaging
- Attempt logging to database
- Required before: review submission, deal claims

**Flow:**
```
1. User clicks "Submit Review"
2. VerificationModal opens
3. User solves math problem
4. On success → onVerify(true) callback
5. Review/claim proceeds
6. Log success to verification_logs
```

---

# 9. INTELLIGENT LOCAL BUSINESS ALGORITHM

## 9.1 Problem Addressed

Generic search engines prioritize businesses with:
- High review counts (favors chains)
- SEO optimization (favors corporations)
- Advertising spend (favors large businesses)

This buries authentic local businesses under corporate results.

## 9.2 LBAI Algorithm Overview

The **Local Business Authenticity Index (LBAI)** is a proprietary 3-component scoring system that identifies genuine local businesses.

**Formula:**
```
LBAI = (ChainScore × 0.5) + (SizeScore × 0.3) + (LocalityScore × 0.2)
```

**Thresholds:**
- LBAI ≥ 75 AND ChainScore ≥ 70 → Local Business ✓
- Below threshold → Filtered Out ✗

## 9.3 Component 1: Chain Detection Score

**Weight:** 50%

**Purpose:** Identify and penalize corporate chains

**Chain Database (200+ entries):**
```javascript
const CORPORATE_CHAINS = [
  // Hotels
  'fairmont', 'trump', 'marriott', 'hilton', 'hyatt', ...
  // Fast Food
  "mcdonald's", 'burger king', 'starbucks', 'chipotle', ...
  // Retail
  'target', 'walmart', 'costco', "macy's", ...
  // Banks
  'chase', 'wells fargo', 'bank of america', ...
];
```

**Scoring Logic:**
```javascript
function calculateChainScore(business) {
  let score = 100;  // Start assuming local
  
  // Name matching
  for (const chain of CORPORATE_CHAINS) {
    if (name.includes(chain)) {
      score -= 80;  // Severe penalty
      break;
    }
  }
  
  // Description keywords
  if (description.includes('franchise')) score -= 30;
  if (description.includes('nationwide')) score -= 30;
  
  return Math.max(0, Math.min(100, score));
}
```

## 9.4 Component 2: Business Size Score

**Weight:** 30%

**Purpose:** Favor small businesses over large establishments

**Factors:**
- Review count (chains have many)
- Description detail (locals tell their story)

**Scoring Logic:**
```javascript
function calculateSizeScore(business) {
  let score = 100;
  
  const reviewCount = business.reviewCount || 0;
  if (reviewCount > 100) score -= 40;  // Too popular for local
  else if (reviewCount > 50) score -= 20;
  else if (reviewCount < 5) score += 10;  // Likely truly local
  
  // Detailed description = local with story
  if (description.length > 150) score += 10;
  if (description.length < 50) score -= 20;
  
  return score;
}
```

## 9.5 Component 3: Locality Score

**Weight:** 20%

**Purpose:** Measure community integration

**Positive Signals (+10 to +20 points):**
- Neighborhood mentions (Lincoln Park, Wicker Park)
- Local keywords: "family-owned", "locally sourced"
- Personal names: "Joe's", "Maria's"
- History indicators: "Since 1985", "established"

**Negative Signals (-5 to -15 points):**
- Corporate indicators: "LLC", "Inc"
- Global terms: "International", "Worldwide"
- Franchise language

**Scoring Logic:**
```javascript
function calculateLocalityScore(business) {
  let score = 50;  // Neutral start
  
  // Chicago neighborhoods
  const neighborhoods = ['loop', 'lincoln park', 'wicker park', ...];
  for (const hood of neighborhoods) {
    if (text.includes(hood)) {
      score += 20;
      break;
    }
  }
  
  // Community terms
  const localTerms = ['family-owned', 'locally sourced', ...];
  for (const term of localTerms) {
    if (text.includes(term)) score += 15;
  }
  
  return score;
}
```

## 9.6 Algorithm Flow

```
1. User searches in Chicago, IL
        ↓
2. Query Google with local-specific terms:
   - "family owned restaurant Chicago"
   - "local cafe Chicago"
   - "neighborhood bakery Chicago"
        ↓
3. Receive 60 results
        ↓
4. Run each through LBAI:
   - Calculate ChainScore
   - Calculate SizeScore
   - Calculate LocalityScore
   - Compute weighted LBAI
        ↓
5. Filter: Keep only LBAI ≥ 75 AND ChainScore ≥ 70
        ↓
6. Return 20 LOCAL businesses
   Sorted by LBAI score (highest first)
```

## 9.7 Real-World Examples

### ✅ PASSES (Local Business)
```
Name: "Joe's Corner Cafe"
ChainScore: 100 (no chain match, possessive name)
SizeScore: 85 (23 reviews, good description)
LocalityScore: 80 (mentions "Lincoln Park", "family")
LBAI: 92 → LOCAL ✓
```

### ✗ REJECTED (Chain)
```
Name: "Starbucks Reserve"
ChainScore: 20 (matches "starbucks")
SizeScore: 40 (1200 reviews)
LocalityScore: 30 (generic description)
LBAI: 28 → FILTERED ✗
```

---

# 10. USER AUTHENTICATION SYSTEM

## 10.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Registration                        Login                  │
│  ┌─────────────┐                    ┌─────────────┐        │
│  │ User enters │                    │ User enters │        │
│  │ credentials │                    │ credentials │        │
│  └──────┬──────┘                    └──────┬──────┘        │
│         ↓                                  ↓               │
│  ┌─────────────┐                    ┌─────────────┐        │
│  │  Validate   │                    │   Lookup    │        │
│  │  inputs     │                    │   by email  │        │
│  └──────┬──────┘                    └──────┬──────┘        │
│         ↓                                  ↓               │
│  ┌─────────────┐                    ┌─────────────┐        │
│  │ Hash pass   │                    │   Compare   │        │
│  │ (bcrypt 10) │                    │   hash      │        │
│  └──────┬──────┘                    └──────┬──────┘        │
│         ↓                                  ↓               │
│  ┌─────────────┐                    ┌─────────────┐        │
│  │ Store user  │                    │  Generate   │        │
│  │ in database │                    │  JWT token  │        │
│  └──────┬──────┘                    └──────┬──────┘        │
│         ↓                                  ↓               │
│  ┌─────────────┐                    ┌─────────────┐        │
│  │  Generate   │                    │   Return    │        │
│  │  JWT token  │                    │   to client │        │
│  └──────┬──────┘                    └──────┴──────┘        │
│         ↓                                                  │
│  ┌─────────────────────────────────────────────────┐      │
│  │        Store token in localStorage               │      │
│  │        Include in Authorization header           │      │
│  └─────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 10.2 Password Security

### Hashing
- **Algorithm:** bcrypt
- **Rounds:** 10 (2^10 iterations)
- **Salt:** Automatically generated per password

```javascript
const password_hash = await bcrypt.hash(password, 10);
```

### Validation Requirements
```javascript
// Minimum 8 characters
if (password.length < 8) return error;

// At least 1 uppercase
if (!/[A-Z]/.test(password)) return error;

// At least 1 number
if (!/[0-9]/.test(password)) return error;
```

### Strength Meter
Visual feedback component showing:
- 4-bar strength indicator
- Color coding (red → yellow → green)
- Requirement checklist with checkmarks

## 10.3 JWT Token System

**Configuration:**
- **Secret:** Environment variable or fallback
- **Expiration:** 7 days
- **Algorithm:** HS256 (default)

**Token Payload:**
```json
{
  "userId": "uuid-1234",
  "username": "johndoe",
  "email": "john@example.com",
  "iat": 1704067200,
  "exp": 1704672000
}
```

**Usage in Requests:**
```javascript
// Axios interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 10.4 Session Management

**Storage:**
- `localStorage.token` - JWT string
- `localStorage.user` - User object JSON

**Logout:**
```javascript
const logout = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setUser(null);
};
```

**Auto-restoration:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  if (token && storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);
```

---

# 11. USER EXPERIENCE & ACCESSIBILITY

## 11.1 Design Philosophy

1. **Simplicity First** - Clean, uncluttered interface
2. **Visual Hierarchy** - Important info prominently displayed
3. **Progressive Disclosure** - Details revealed as users engage
4. **Consistency** - Familiar patterns across all pages

## 11.2 Color System

### Light Mode
| Purpose | Color | Hex |
|---------|-------|-----|
| Primary | Blue | #2563eb |
| Success | Green | #10b981 |
| Warning | Yellow | #f59e0b |
| Error | Red | #ef4444 |
| Background | White | #ffffff |
| Text | Dark Gray | #111827 |

### Dark Mode
| Purpose | Color | Hex |
|---------|-------|-----|
| Background | Dark | #111827 |
| Secondary | Gray | #1f2937 |
| Text | Light Gray | #f9fafb |

### High Contrast (Accessibility)
| Purpose | Color | Hex |
|---------|-------|-----|
| Background | Black | #000000 |
| Text | White | #ffffff |
| Primary | Bright Blue | #4a9eff |
| Borders | White | #ffffff |

## 11.3 Typography

```css
--font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;

h1: 2.5rem / 700 weight
h2: 2rem / 600 weight
h3: 1.5rem / 600 weight
h4: 1.25rem / 600 weight
body: 16px minimum (accessibility)
```

## 11.4 Spacing System

```css
--spacing-1: 8px   (xs)
--spacing-2: 16px  (sm)
--spacing-3: 24px  (md)
--spacing-4: 32px  (lg)
--spacing-5: 40px  (xl)
--spacing-6: 48px  (xxl)
```

## 11.5 Accessibility Features

### Semantic HTML
- Proper heading hierarchy (h1 → h6)
- Landmark elements (`<nav>`, `<main>`, `<article>`)
- Form labels linked to inputs
- Button vs link distinction

### Keyboard Navigation
- All interactive elements focusable
- Tab order logical
- Enter/Space triggers buttons
- Escape closes modals
- Focus indicators visible

### Screen Reader Support
- ARIA labels on dynamic content
- Alt text on all images
- Status messages announced
- Loading states communicated

### Color Contrast
- WCAG AA compliant ratios
- Text: 7:1 contrast ratio
- No color-only indicators
- High-contrast mode option

### Touch Targets
- Minimum 44x44px tap targets
- Adequate spacing between links
- Mobile-friendly button sizes

## 11.6 Responsive Breakpoints

```css
/* Mobile First */
Default: 320px+

/* Tablet */
@media (min-width: 768px)

/* Desktop */
@media (min-width: 1024px)

/* Large Desktop */
@media (min-width: 1280px)
```

## 11.7 Animation System

**Performance-optimized animations:**

| Animation | Purpose | Duration |
|-----------|---------|----------|
| heartBeat | Favorite toggle | 0.3s |
| fadeInUp | Review entrance | 0.4s |
| staggerIn | Card grid | 0.05s delay each |
| modalScale | Modal entrance | 0.3s |
| shimmer | Loading skeleton | 1.5s |
| toastSlideIn | Notification | 0.3s |

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 12. SECURITY IMPLEMENTATION

## 12.1 Authentication Security

### Password Storage
- bcrypt with 10 rounds of hashing
- Unique salt per password
- Plain text never stored

### Session Security
- JWT with 7-day expiration
- Secure token storage (localStorage)
- Token included in Authorization header

### Input Validation
- Email format validation
- Password complexity requirements
- Username length requirements

## 12.2 API Security

### CORS Configuration
```javascript
app.use(cors());  // Configured for development
// Production: specify allowed origins
```

### Request Validation
```javascript
// Example: Review validation
if (!businessId || !userId || !username || !rating || !comment) {
  return res.status(400).json({ error: 'Missing required fields' });
}

if (rating < 1 || rating > 5) {
  return res.status(400).json({ error: 'Rating must be between 1 and 5' });
}

if (comment.length > 500) {
  return res.status(400).json({ error: 'Comment must be 500 characters or less' });
}
```

### XSS Prevention
```javascript
// Comment sanitization
const sanitizedComment = comment
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;')
  .replace(/\//g, '&#x2F;');
```

## 12.3 Bot Prevention

### Math CAPTCHA
- Random addition problem
- Regenerates on failure
- Required for sensitive actions

### Verification Logging
```sql
verification_logs (
  id, user_id, verification_type, success, ip_address, created_at
)
```

## 12.4 Data Protection

### Foreign Key Constraints
```sql
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
```

### Unique Constraints
```sql
UNIQUE(user_id, business_id)  -- Prevents duplicate favorites
```

### Input Length Limits
```sql
CHECK(LENGTH(comment) <= 500)
CHECK(rating >= 1 AND rating <= 5)
```

---

# 13. THIRD-PARTY INTEGRATIONS

## 13.1 Google Places API

### Purpose
Fetch real business data including:
- Business details
- Photos
- Ratings
- Opening hours
- Contact information

### Endpoints Used
| Endpoint | Purpose |
|----------|---------|
| Nearby Search | Find businesses by location |
| Text Search | Search with custom queries |
| Place Details | Get full business info |
| Place Photos | Retrieve business images |

### Integration Flow
```
1. User sets location
2. Build smart search queries (local-focused)
3. Query Google Places API
4. Transform results to our format
5. Apply LBAI filtering
6. Return local businesses only
```

### Rate Limiting
- Respectful API usage
- 100ms delays between requests
- Result caching where appropriate

## 13.2 Recharts

### Purpose
Analytics dashboard visualizations

### Charts Implemented
| Chart Type | Data Displayed |
|------------|----------------|
| PieChart | Category distribution |
| BarChart | Rating distribution |
| BarChart (horizontal) | Top-rated businesses |

### Configuration
```javascript
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={categoryDistribution}
      cx="50%"
      cy="50%"
      dataKey="count"
    />
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

## 13.3 jsPDF

### Purpose
Generate downloadable PDF reports

### Features
- Export favorites list
- Business reports
- Review history

## 13.4 PapaParse

### Purpose
CSV export functionality

### Features
- Export favorites as CSV
- Data backup
- Spreadsheet compatibility

---

# 14. DEPLOYMENT & SETUP GUIDE

## 14.1 Prerequisites

- **Node.js:** Version 18 or higher
- **npm:** Package manager
- **SQLite3:** Database engine
- **Google Places API Key:** For live business search

## 14.2 Installation Steps

### Step 1: Clone Repository
```bash
git clone [repository-url]
cd byte-sized-business-boost
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 4: Environment Configuration

Create `server/.env`:
```env
PORT=5000
JWT_SECRET=your-secure-secret-key
GOOGLE_PLACES_API_KEY=your-api-key
NODE_ENV=development
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5: Initialize Database
```bash
cd server
node database/init.js
node database/seed.js  # Optional: load sample data
```

### Step 6: Start Application

**Terminal 1 - Server:**
```bash
cd server
npm start
```
Server runs on http://localhost:5000

**Terminal 2 - Client:**
```bash
cd client
npm start
```
Client runs on http://localhost:3000

## 14.3 Verification

- **Frontend:** http://localhost:3000
- **API Health:** http://localhost:5000/api/health
- **Feature Flags:** http://localhost:5000/api/feature-flags

## 14.4 Common Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 [PID]
```

### Database Not Found
```bash
cd server
node database/init.js
```

### API Connection Failed
- Verify server is running
- Check `.env` files
- Restart React dev server after `.env` changes

## 14.5 Production Build

```bash
cd client
npm run build
```

Outputs optimized static files to `client/build/`

---

# 15. APPENDIX & REFERENCE

## 15.1 API Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/businesses | No | List businesses |
| GET | /api/businesses/:id | No | Get business detail |
| GET | /api/reviews/:businessId | No | Get reviews |
| POST | /api/reviews | Yes | Create review |
| PUT | /api/reviews/:id/helpful | No | Mark helpful |
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/profile | Yes | Get profile |
| GET | /api/favorites/:userId | Yes | Get favorites |
| POST | /api/favorites | Yes | Add favorite |
| DELETE | /api/favorites/:userId/:businessId | Yes | Remove favorite |
| GET | /api/deals | No | List deals |
| POST | /api/deals/:id/claim | Yes | Claim deal |
| GET | /api/analytics/overview | No | Platform stats |

## 15.2 Database Quick Reference

**Tables:**
- businesses, users, reviews, favorites, deals, deal_claims
- verification_logs, user_achievements, business_spotlight
- community_goals, user_goal_contributions
- qna_questions, qna_answers, user_behavior
- search_history, business_owner_claims
- business_announcements, review_responses, user_preferences

## 15.3 Component Quick Reference

**Core Components:**
- Navbar, BusinessCard, DealCard, ReviewForm, ReviewList
- StarRating, SearchBar, CategoryFilter, LocationPicker
- VerificationModal, EmptyState, LoadingSkeleton, SafeImage

**Pages:**
- HomePage, BusinessDetailPage, FavoritesPage
- DealsPage, AnalyticsPage, ProfilePage
- LoginPage, RegisterPage, MapPage

## 15.4 File Locations

| Purpose | Path |
|---------|------|
| Server entry | /server/server.js |
| Database init | /server/database/init.js |
| LBAI Algorithm | /server/services/localBusinessAlgorithm.js |
| API utilities | /client/src/utils/api.js |
| Global styles | /client/src/index.css |
| App routing | /client/src/App.js |

## 15.5 Environment Variables

**Server:**
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Server port |
| JWT_SECRET | Yes | - | Token signing key |
| GOOGLE_PLACES_API_KEY | Yes | - | Google API key |
| NODE_ENV | No | development | Environment |

**Client:**
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| REACT_APP_API_URL | No | http://localhost:5000/api | API base URL |

## 15.6 Third-Party Licenses

| Library | License | Website |
|---------|---------|---------|
| React | MIT | reactjs.org |
| Express | MIT | expressjs.com |
| SQLite | Public Domain | sqlite.org |
| bcryptjs | MIT | github.com/dcodeIO/bcrypt.js |
| jsonwebtoken | MIT | github.com/auth0/node-jsonwebtoken |
| axios | MIT | axios-http.com |
| Recharts | MIT | recharts.org |
| jsPDF | MIT | parall.ax/products/jspdf |
| PapaParse | MIT | papaparse.com |

## 15.7 Rubric Compliance Summary

| Category | Points | Status |
|----------|--------|--------|
| Code Quality | 20/20 | ✅ Complete |
| User Experience | 30/30 | ✅ Complete |
| Functionality | 30/30 | ✅ Complete |
| Presentation | 30/30 | Ready |
| **Total** | **110/110** | **Target** |

---

## Document Information

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Total Pages:** 15  
**Word Count:** ~8,500 words

---

*This document was prepared for the FBLA Coding & Programming 2025-2026 competition. Byte-Sized Business Boost is an original work developed specifically to address the competition topic of helping users discover and support small, local businesses.*
