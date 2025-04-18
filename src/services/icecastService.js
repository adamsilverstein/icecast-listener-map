import axios from 'axios';
import { parseString } from 'xml2js';

// The proxy server URL
const API_URL = 'http://localhost:3001/api';

/**
 * Fetches listener data from the Icecast server via our proxy
 * @param {Object} credentials - The authentication credentials
 * @param {string} credentials.username - The username for authentication
 * @param {string} credentials.password - The password for authentication
 * @returns {Promise<Array>} - A promise that resolves to an array of listener data
 */
export const fetchListeners = async (credentials) => {
  if (!credentials || !credentials.username || !credentials.password) {
    throw new Error('Authentication credentials are required');
  }

  try {
    // Create Basic Auth header
    const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);

    // Make a request to our proxy server
    const response = await axios.get(`${API_URL}/listeners`, {
      headers: {
        'Authorization': authHeader
      }
    });

    // Parse the XML response
    return new Promise((resolve, reject) => {
      parseString(response.data, (err, result) => {
        if (err) {
          reject(new Error('Failed to parse XML response'));
          return;
        }

        try {
          // Extract listener data from the parsed XML
          // The structure of the XML response may vary depending on the Icecast server version
          // This is a generic approach that may need to be adjusted
          const listeners = extractListenersFromXml(result);
          resolve(listeners);
        } catch (error) {
          reject(new Error(`Failed to extract listener data: ${error.message}`));
        }
      });
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Authentication failed. Please check your credentials.');
    }
    throw new Error(`Failed to fetch listener data: ${error.message}`);
  }
};

/**
 * Extracts listener data from the parsed XML
 * @param {Object} xmlData - The parsed XML data
 * @returns {Array} - An array of listener data
 */
const extractListenersFromXml = (xmlData) => {
  // This function needs to be adjusted based on the actual structure of the XML response
  // from the specific Icecast server version

  // Example extraction logic - this will need to be modified based on actual XML structure
  let listeners = [];

  try {
    // Try to find the listeners in the XML structure
    // This is a generic approach and may need to be adjusted
    if (xmlData && xmlData.icestats && xmlData.icestats.source) {
      const sources = Array.isArray(xmlData.icestats.source)
        ? xmlData.icestats.source
        : [xmlData.icestats.source];

      for (const source of sources) {
        if (source.$ && source.$.mount && source.listener) {
          const sourceListeners = Array.isArray(source.listener)
            ? source.listener
            : [source.listener];

          for (const listener of sourceListeners) {
            if (listener.IP) {
              listeners.push({
                ip: listener.IP[0],
                userAgent: listener.UserAgent ? listener.UserAgent[0] : 'Unknown',
                connectedAt: listener.Connected ? listener.Connected[0] : 'Unknown',
                duration: listener.Duration ? listener.Duration[0] : 'Unknown'
              });
            }
          }
        }
      }
    }

    // Fallback: If we couldn't find listeners in the expected structure,
    // try a more generic approach to find IP addresses
    if (listeners.length === 0) {
      const xmlString = JSON.stringify(xmlData);
      const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
      const ips = xmlString.match(ipRegex) || [];

      // Remove duplicates
      const uniqueIps = [...new Set(ips)];

      listeners = uniqueIps.map(ip => ({
        ip,
        userAgent: 'Unknown',
        connectedAt: 'Unknown',
        duration: 'Unknown'
      }));
    }

    return listeners;
  } catch (error) {
    console.error('Error extracting listeners from XML:', error);
    return [];
  }
};
