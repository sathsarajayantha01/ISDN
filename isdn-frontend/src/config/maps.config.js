/**
 * Google Maps Configuration
 *
 * IMPORTANT: Replace the API key with your actual Google Maps API key
 * For security, use environment variables instead:
 *
 * 1. Create a .env file in the project root
 * 2. Add: VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
 * 3. Access via: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
 *
 * See GOOGLE_MAPS_SETUP.md for detailed setup instructions
 */

// Option 1: Hardcoded (Not recommended for production)
// export const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Option 2: Environment variable (Recommended)
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Default map center (Colombo, Sri Lanka)
export const DEFAULT_MAP_CENTER = {
  lat: 6.9271,
  lng: 79.8612,
};

// Default zoom level
export const DEFAULT_MAP_ZOOM = 13;

// Map configuration options
export const MAP_OPTIONS = {
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
};
