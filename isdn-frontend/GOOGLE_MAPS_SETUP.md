# Google Maps Integration Setup Guide

This guide will help you set up Google Maps API for the location picker feature in the ISDN application.

## Prerequisites

- A Google account
- A Google Cloud Platform (GCP) project

## Step 1: Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** (optional, for address search)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

## Step 2: Restrict Your API Key (Recommended for Security)

1. Click on your newly created API key
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add your authorized domains:
   - `localhost:*` (for development)
   - Your production domain (e.g., `yourdomain.com`)
4. Under **API restrictions**, select **Restrict key**
5. Select:
   - Maps JavaScript API
   - Places API (if using)
6. Click **Save**

## Step 3: Configure Your Application

Replace `YOUR_GOOGLE_MAPS_API_KEY` in the following files with your actual API key:

### Files to Update:

1. **src/pages/Login/LoginSignUpModel.jsx**

   ```javascript
   const GOOGLE_MAPS_API_KEY = "YOUR_ACTUAL_API_KEY_HERE";
   ```

2. **src/pages/Users/models/UserCreateModel.jsx**

   ```javascript
   const GOOGLE_MAPS_API_KEY = "YOUR_ACTUAL_API_KEY_HERE";
   ```

3. **src/pages/Users/models/UserUpdateModel.jsx**
   ```javascript
   const GOOGLE_MAPS_API_KEY = "YOUR_ACTUAL_API_KEY_HERE";
   ```

## Step 4: Environment Variables (Recommended Approach)

For better security, use environment variables instead of hardcoding the API key:

### 4.1 Create a `.env` file in your project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4.2 Update the files to use environment variable:

Instead of:

```javascript
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
```

Use:

```javascript
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

### 4.3 Add `.env` to `.gitignore`:

Make sure your `.gitignore` file includes:

```
.env
.env.local
```

## Step 5: Verify Setup

1. Start your development server:

   ```bash
   yarn dev
   ```

2. Navigate to the sign-up page or user creation form
3. You should see an interactive Google Map
4. Click on the map to set a location
5. The latitude and longitude fields should update automatically

## Features

The map picker includes:

- ✅ Interactive map with click-to-select location
- ✅ Draggable marker for precise positioning
- ✅ Manual coordinate input fields
- ✅ Real-time coordinate display
- ✅ Map centering on selected location
- ✅ Default center set to Colombo, Sri Lanka (6.9271, 79.8612)

## Troubleshooting

### Map Not Loading

- Check if your API key is correct
- Verify that Maps JavaScript API is enabled in GCP
- Check browser console for errors
- Ensure your domain is whitelisted in API restrictions

### "For development purposes only" watermark

- This appears when using an unrestricted API key
- Add billing information to your GCP project
- Properly restrict your API key

### Coordinates Not Updating

- Check browser console for JavaScript errors
- Verify that the MapPicker component is properly imported
- Ensure latitude/longitude fields are properly named

## Cost Considerations

Google Maps offers a $200 monthly free credit for Maps, Routes, and Places:

- **Free tier**: Up to approximately 28,000 map loads per month
- **Pricing**: $7 per 1,000 additional loads after free tier

### Tips to Minimize Costs:

1. Implement proper API key restrictions
2. Cache map tiles when possible
3. Monitor usage in Google Cloud Console
4. Set up billing alerts

## Support

For more information:

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [API Key Best Practices](https://developers.google.com/maps/api-key-best-practices)
- [Pricing Information](https://mapsplatform.google.com/pricing/)

## Security Best Practices

1. **Never commit API keys to version control**
2. **Always use environment variables**
3. **Restrict API key usage by domain**
4. **Enable only necessary APIs**
5. **Set up billing alerts**
6. **Rotate keys regularly**
7. **Monitor usage in Google Cloud Console**

---

Last updated: February 2026
