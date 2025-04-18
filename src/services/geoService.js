import axios from 'axios';

// The proxy server URL
const API_URL = 'http://localhost:3001/api';

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Local storage key for the geolocation cache
const CACHE_KEY = 'icecast_geolocation_cache';

/**
 * Loads the geolocation cache from local storage
 * @returns {Object} - The geolocation cache
 */
const loadCache = () => {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    return cacheData ? JSON.parse(cacheData) : {};
  } catch (error) {
    console.error('Error loading geolocation cache:', error);
    return {};
  }
};

/**
 * Saves the geolocation cache to local storage
 * @param {Object} cache - The geolocation cache to save
 */
const saveCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving geolocation cache:', error);
  }
};

/**
 * Checks if a cached geolocation entry is still valid
 * @param {Object} entry - The cached geolocation entry
 * @returns {boolean} - Whether the entry is still valid
 */
const isCacheValid = (entry) => {
  return entry && entry.timestamp && (Date.now() - entry.timestamp) < CACHE_EXPIRATION;
};

/**
 * Geolocates an IP address using our proxy server
 * @param {string} ip - The IP address to geolocate
 * @returns {Promise<Object>} - A promise that resolves to the geolocation data
 */
const geolocateIP = async (ip) => {
  try {
    // Try ipapi.co through our proxy server
    const response = await axios.get(`${API_URL}/geolocate/ipapi/${ip}`);

    // Format the response data
    return {
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      city: response.data.city || 'Unknown',
      region: response.data.region || 'Unknown',
      country: response.data.country_name || 'Unknown',
      countryCode: response.data.country_code || 'Unknown',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Error geolocating IP ${ip} with primary service:`, error);

    // Fallback to ipinfo.io through our proxy server
    try {
      const fallbackResponse = await axios.get(`${API_URL}/geolocate/ipinfo/${ip}`);

      // Extract latitude and longitude from the loc field (format: "lat,lon")
      const [latitude, longitude] = fallbackResponse.data.loc ?
        fallbackResponse.data.loc.split(',').map(coord => parseFloat(coord)) :
        [0, 0];

      return {
        latitude,
        longitude,
        city: fallbackResponse.data.city || 'Unknown',
        region: fallbackResponse.data.region || 'Unknown',
        country: fallbackResponse.data.country ?
          // Convert country code to full name (simplified approach)
          new Intl.DisplayNames(['en'], { type: 'region' }).of(fallbackResponse.data.country) :
          'Unknown',
        countryCode: fallbackResponse.data.country || 'Unknown',
        timestamp: Date.now()
      };
    } catch (fallbackError) {
      console.error(`Fallback geolocation for IP ${ip} also failed:`, fallbackError);

      // Return default coordinates instead of throwing an error
      // This allows the map to still function even if geolocation fails
      return {
        latitude: 0,
        longitude: 0,
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        countryCode: 'Unknown',
        timestamp: Date.now(),
        error: 'Geolocation failed'
      };
    }
  }
};

/**
 * Geolocates an array of IP addresses with caching
 * @param {Array<Object>} listeners - Array of listener objects with IP addresses
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of listeners with geolocation data
 */
export const geolocateListeners = async (listeners) => {
  if (!listeners || !Array.isArray(listeners)) {
    return [];
  }

  // Load the cache
  const cache = loadCache();
  const updatedCache = { ...cache };
  const geolocatedListeners = [];

  // Process each listener
  for (const listener of listeners) {
    const ip = listener.ip;

    if (!ip) {
      continue;
    }

    try {
      let geoData;

      // Check if we have a valid cached entry
      if (cache[ip] && isCacheValid(cache[ip])) {
        geoData = cache[ip];
      } else {
        // Geolocate the IP and update the cache
        geoData = await geolocateIP(ip);
        updatedCache[ip] = geoData;
      }

      // Add geolocation data to the listener
      geolocatedListeners.push({
        ...listener,
        geo: geoData
      });
    } catch (error) {
      // If geolocation fails, still include the listener but with null geo data
      geolocatedListeners.push({
        ...listener,
        geo: null
      });
    }
  }

  // Save the updated cache
  saveCache(updatedCache);

  return geolocatedListeners;
};

/**
 * Clears the geolocation cache
 */
export const clearGeoCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
