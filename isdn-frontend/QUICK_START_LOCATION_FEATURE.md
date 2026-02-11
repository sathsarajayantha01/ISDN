# Quick Start Checklist ✓

Follow these simple steps to get the location picker working:

## Step 1: Get Google Maps API Key

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project (or select existing)
- [ ] Enable **Maps JavaScript API**
- [ ] Create API credentials → API Key
- [ ] Copy your API key

## Step 2: Configure Your API Key

- [ ] Create `.env` file in project root (copy from `.env.example`)
- [ ] Open `.env` file
- [ ] Replace `your_google_maps_api_key_here` with your actual API key
- [ ] Save the file

**Your .env should look like:**

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA1234567890abcdefghijklmnopqrstuv
```

## Step 3: Restart Development Server

- [ ] Stop the current dev server (Ctrl+C)
- [ ] Run `yarn dev` to restart
- [ ] Wait for the server to start

## Step 4: Test the Feature

### Test Sign-Up Form:

- [ ] Open your browser to the login/sign-up page
- [ ] Click "Create Account" or "Sign Up"
- [ ] Scroll down to see the Google Map
- [ ] Click anywhere on the map
- [ ] Verify the latitude and longitude fields update
- [ ] Try dragging the marker
- [ ] Submit the form and check if user is created

### Test Admin User Creation:

- [ ] Login as admin
- [ ] Navigate to Users page
- [ ] Click "Add User" button
- [ ] Fill in required fields
- [ ] Scroll to map section
- [ ] Click on map to select location
- [ ] Submit and verify user creation

### Test User Update:

- [ ] Go to Users page
- [ ] Click edit on any user
- [ ] See map centered on user's location
- [ ] Click to update location
- [ ] Save and verify update

## Step 5: Optional - Secure Your API Key

- [ ] Go to Google Cloud Console → Credentials
- [ ] Click on your API key
- [ ] Set "Application restrictions" → "HTTP referrers"
- [ ] Add: `localhost:*` and your production domain
- [ ] Save restrictions

## Troubleshooting

### ❌ Map shows "For development purposes only"

**Solution:** Add billing information to your Google Cloud project

### ❌ Map doesn't load at all

**Solution:**

1. Check if API key is correct in `.env`
2. Verify Maps JavaScript API is enabled
3. Check browser console for errors
4. Clear browser cache and reload

### ❌ "This page can't load Google Maps correctly"

**Solution:**

1. Check API key is valid
2. Check billing is enabled on GCP
3. Verify API restrictions allow your domain

### ❌ Coordinates not updating when clicking map

**Solution:**

1. Check browser console for JavaScript errors
2. Ensure you restarted the dev server after adding API key
3. Try hard refresh (Ctrl+Shift+R)

## Need More Help?

📖 **Detailed guides:**

- Read [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md) for complete setup instructions
- Read [LOCATION_FEATURE_SUMMARY.md](LOCATION_FEATURE_SUMMARY.md) for technical details

💡 **Quick tips:**

- Default map center is set to Colombo, Sri Lanka
- You can manually enter coordinates if preferred
- Marker can be dragged to fine-tune position
- Both map click and manual input work together

## Files Modified

✅ Created: `src/components/ui/MapPicker.jsx`
✅ Created: `src/config/maps.config.js`
✅ Updated: `src/pages/Login/LoginSignUpModel.jsx`
✅ Updated: `src/pages/Users/models/UserCreateModel.jsx`
✅ Updated: `src/pages/Users/models/UserUpdateModel.jsx`
✅ Updated: `.gitignore`

## API Integration

✅ Forms now send `latitude` and `longitude` to your API
✅ Coordinates are properly swapped to match your API format
✅ Address field included
✅ All required fields validated

---

**You're all set! 🎉** Just add your API key and start using the location picker!
