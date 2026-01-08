# Copyright, Attribution & Open Source Documentation
## Byte-Sized Business Boost

---

## Development Attribution

**Project Name**: Byte-Sized Business Boost  
**Developed For**: FBLA Coding & Programming 2025-2026  
**Topic**: Helping users discover and support small, local businesses  
**Development Period**: November 2025  
**Team**: [Your Team Name/Members]  
**School**: [Your School]  
**Chapter**: [Your FBLA Chapter]

---

## Original Code

### Percentage of Original Code: ~95%

All core business logic, algorithms, components, and features were developed from scratch specifically for this competition, including:

1. **Local Business Authenticity Index (LBAI Algorithm)** - 100% original
   - Chain detection system
   - Business size scoring
   - Locality measurement
   - Composite scoring formula

2. **Frontend Components** - 100% original
   - All React components custom-built
   - Custom hooks and contexts
   - UI/UX design and layout

3. **Backend Architecture** - 100% original
   - RESTful API design
   - Database schema design
   - Route handlers and middleware
   - Google Places integration logic

4. **Database Design** - 100% original
   - SQLite schema
   - Seed scripts
   - Data relationships

---

## Third-Party Libraries & Frameworks

### Backend Dependencies

#### Core Framework
**Express.js** - v4.18.2  
- **License**: MIT License
- **Copyright**: © 2009-2014 TJ Holowaychuk, © 2013-2014 StrongLoop  
- **Website**: https://expressjs.com/  
- **Usage**: Web application framework for Node.js  
- **Why Used**: Industry-standard for building RESTful APIs

#### Database
**SQLite3** - v5.1.7  
- **License**: Public Domain  
- **Website**: https://www.sqlite.org/  
- **Usage**: Standalone SQL database engine  
- **Why Used**: Required for FBLA standalone application requirement

**better-sqlite3** - Node.js bindings  
- **License**: MIT License  
- **Copyright**: © Joshua Wise  
- **Website**: https://github.com/WiseLibs/better-sqlite3  

#### Security & Authentication
**bcryptjs** - v2.4.3  
- **License**: MIT License  
- **Copyright**: © 2013 Nevins Bartolomeo  
- **Website**: https://github.com/dcodeIO/bcrypt.js  
- **Usage**: Password hashing  
- **Why Used**: Secure user authentication

**jsonwebtoken** - v9.0.2  
- **License**: MIT License  
- **Copyright**: © 2015 Auth0, Inc.  
- **Website**: https://github.com/auth0/node-jsonwebtoken  
- **Usage**: JWT token generation and verification  

**dotenv** - v16.4.5  
- **License**: BSD-2-Clause  
- **Copyright**: © Scott Motte  
- **Website**: https://github.com/motdotla/dotenv  
- **Usage**: Environment variable management  

#### HTTP & API
**axios** - v1.6.2  
- **License**: MIT License  
- **Copyright**: © 2014-present Matt Zabriskie  
- **Website**: https://axios-http.com/  
- **Usage**: HTTP client for Google Places API calls  
- **Why Used**: Promise-based HTTP requests

**cors** - v2.8.5  
- **License**: MIT License  
- **Copyright**: © 2013 Troy Goode  
- **Website**: https://github.com/expressjs/cors  
- **Usage**: Enable Cross-Origin Resource Sharing  

#### Utilities
**uuid** - v9.0.1  
- **License**: MIT License  
- **Copyright**: © Robert Kieffer  
- **Website**: https://github.com/uuidjs/uuid  
- **Usage**: Generate unique identifiers for database records  

---

### Frontend Dependencies

#### Core Framework
**React** - v18.2.0  
- **License**: MIT License  
- **Copyright**: © Meta Platforms, Inc.  
- **Website**: https://react.dev/  
- **Usage**: Component-based UI library  
- **Why Used**: Industry standard for building interactive UIs

**React DOM** - v18.2.0  
- **License**: MIT License  
- **Copyright**: © Meta Platforms, Inc.  
- **Usage**: React renderer for web browsers  

**React Router DOM** - v6.20.0  
- **License**: MIT License  
- **Copyright**: © Remix Software Inc.  
- **Website**: https://reactrouter.com/  
- **Usage**: Client-side routing  
- **Why Used**: Multi-page navigation without page reloads

#### Development Tools
**Create React App** - v5.0.1  
- **License**: MIT License  
- **Copyright**: © Meta Platforms, Inc.  
- **Website**: https://create-react-app.dev/  
- **Usage**: React application scaffolding and build tools  
- **Why Used**: Simplifies development setup

---

## External APIs

### Google Places API
- **Provider**: Google LLC  
- **API Version**: Places API (New)  
- **Website**: https://developers.google.com/maps/documentation/places/web-service  
- **Terms of Service**: https://cloud.google.com/maps-platform/terms  
- **Usage**: Fetching real business data (names, addresses, ratings, photos)  
- **Attribution Required**: Yes  
- **Attribution Display**: "Powered by Google" displayed in app  
- **Data Usage**: Business information including:
  - Business names
  - Addresses
  - Phone numbers
  - Operating hours
  - Ratings and reviews
  - Photos
- **API Key**: Environment variable (not exposed in code)  
- **Cost**: Free tier (first $200/month of usage)

**Google Places API Attribution**:
- All business data sourced from Google Places API
- Photos remain property of their original contributors
- Map data © 2025 Google

---

## Fonts & Typography

**System Fonts Stack**  
- **License**: Various (System-provided)  
- **Fonts Used**:
  - -apple-system (macOS/iOS)
  - BlinkMacSystemFont (macOS Chrome)
  - "Segoe UI" (Windows)
  - Roboto (Android)
  - "Helvetica Neue" (fallback)
  - Arial (fallback)
  - sans-serif (final fallback)
- **Why Used**: Native system fonts provide optimal performance and accessibility

---

## Icons & Graphics

### Icons
**Unicode/Emoji Icons**  
- **License**: Unicode License  
- **Usage**: Star ratings (⭐), navigation icons  
- **Why Used**: No external dependencies, universal compatibility

### Business Photos
**Google Places API Photos**  
- **Source**: Google Places API  
- **License**: Subject to Google Maps Platform Terms of Service  
- **Attribution**: Photo credits to original contributors  
- **Usage**: Display only, as provided by Google API

---

## Code Inspirations & References

### Algorithm Development
**Local Business Filtering Concept**  
- **Inspiration**: Need to distinguish chains from local businesses  
- **Original Implementation**: Yes (100% custom algorithm)  
- **Formula**: LBAI = (ChainScore × 0.5) + (SizeScore × 0.3) + (LocalityScore × 0.2)

### Design Patterns
**RESTful API Architecture**  
- **Reference**: Industry best practices  
- **Implementation**: Custom routes and handlers  
- **Resources**: MDN Web Docs, Express.js documentation

**React Component Patterns**  
- **Reference**: React documentation, industry patterns  
- **Implementation**: Custom components following React best practices  
- **Resources**: React.dev official documentation

---

## Educational Resources

### Learning References
- **MDN Web Docs**: https://developer.mozilla.org/  
- **React Documentation**: https://react.dev/  
- **Node.js Documentation**: https://nodejs.org/docs/  
- **Express.js Guide**: https://expressjs.com/guide/  
- **SQLite Documentation**: https://www.sqlite.org/docs.html  
- **Google Places API Docs**: https://developers.google.com/maps/documentation/places

### Code.org Partnership
This topic was created in partnership with Code.org  
- **Website**: https://code.org/  
- **Mission**: Expanding computer science education  

---

## License Information

### Project License
**MIT License** (Recommended for FBLA projects)

```
MIT License

Copyright (c) 2025 [Your Name/Team]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Data Privacy & Security

### User Data Handling
- **Password Storage**: Bcrypt hashing (industry standard)
- **Authentication**: JWT tokens (secure, stateless)
- **API Keys**: Stored in environment variables (never committed to git)
- **User Data**: Stored locally in SQLite database
- **No External Data Sharing**: All user data remains on local machine

### Google API Compliance
- API key properly secured in .env file
- Attribution requirements met
- Terms of Service compliance
- Rate limiting respected

---

## No Copyright Infringement

We certify that:
1. All original code was written by our team
2. All third-party libraries are properly licensed and attributed
3. All API usage complies with terms of service
4. No copyrighted materials were used without permission
5. All business data is properly attributed to Google Places API

---

## Contact & Support

For questions about attributions or licenses:
- **Team**: [Your Team Name]
- **School**: [Your School]
- **Adviser**: [Adviser Name]
- **Email**: [Contact Email]

---

**Last Updated**: November 21, 2025  
**Document Version**: 1.0
