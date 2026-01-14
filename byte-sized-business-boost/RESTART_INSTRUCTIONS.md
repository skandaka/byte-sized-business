# 🔄 Restart Instructions

## Issue Fixed
The client was pointing to the wrong API port. The server runs on **port 5001**, not 5000.

## What Was Changed
1. ✅ Fixed [client/.env](client/.env) to point to `http://localhost:5001/api`
2. ✅ Updated [api.js](client/src/utils/api.js) to include location parameters (lat, lng, radius)
3. ✅ Server restarted with new feature flags

## To See the Changes

### Stop and restart the React development server:

```bash
# Stop the current React dev server (Ctrl+C in the terminal where it's running)

# Then restart it:
cd client
npm start
```

**IMPORTANT:** React apps require a restart to pick up `.env` changes. Simply refreshing the browser won't work.

## Expected Behavior After Restart

1. **Homepage loads with businesses**
   - Should show ~29 businesses within 10 miles of Chicago
   - Each card shows distance (e.g., "0.4 mi")

2. **Location picker works**
   - "Use My Location" requests browser permission
   - Manual city input geocodes the city
   - Radius slider filters results

3. **Delivery badges are clickable**
   - Hover shows blue highlight
   - Click opens service in new tab

4. **High-contrast mode**
   - 🎨 button toggles accessibility mode
   - Black background, white text, thick borders

## Testing After Restart

1. Visit http://localhost:3000
2. You should immediately see businesses
3. Try changing the radius to 5 miles
4. Verify the list updates with fewer businesses
5. Click on a delivery badge (Uber Eats, DoorDash, etc.)

## If Still Not Working

Check the browser console (F12) for errors. Common issues:

### API Connection Errors
```
Failed to fetch businesses
```
**Solution:** Verify server is running on port 5001:
```bash
curl http://localhost:5001/api/health
```

### No Businesses Showing
```
Showing 0 businesses
```
**Solution:** Check that location has coordinates:
- Open browser DevTools → Console
- Type: `localStorage.clear()` and press Enter
- Refresh the page
- Location picker should default to Chicago

### Port Already in Use
```
Port 3000 is already in use
```
**Solution:** Kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

## API Endpoints to Test

```bash
# Health check
curl http://localhost:5001/api/health

# All businesses (no location)
curl http://localhost:5001/api/businesses

# Businesses near Chicago within 10 miles
curl "http://localhost:5001/api/businesses?lat=41.8781&lng=-87.6298&radius=10"

# With external partners
curl "http://localhost:5001/api/businesses?lat=41.8781&lng=-87.6298&radius=10&external=true"

# Feature flags
curl http://localhost:5001/api/feature-flags
```

## Summary

The backend is fully functional! You just need to **restart the React dev server** to pick up the corrected `.env` file that points to port 5001.

After restarting, everything should work perfectly. 🎉
