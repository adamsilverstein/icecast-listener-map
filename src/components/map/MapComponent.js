import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';

// You would typically set this in an environment variable
// For this example, we'll use a public token with restricted usage
// In production, you should use your own token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// Set the Mapbox access token
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 5px;
  overflow: hidden;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  font-weight: bold;
`;

const MapComponent = ({ listeners, isLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);

  // Initialize the map
  useEffect(() => {
    if (map.current) return; // Map already initialized

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 20], // Center on the world
      zoom: 1.5
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when listeners change
  useEffect(() => {
    if (!map.current || !listeners || isLoading) return;

    // Remove existing markers
    markers.forEach(marker => marker.remove());

    // Create new markers
    const newMarkers = listeners
      .filter(listener => listener.geo && !listener.geo.error &&
              typeof listener.geo.latitude === 'number' &&
              typeof listener.geo.longitude === 'number' &&
              (listener.geo.latitude !== 0 || listener.geo.longitude !== 0))
      .map(listener => {
        // Create a popup with listener information
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h4>${listener.geo.city || 'Unknown'}, ${listener.geo.country || 'Unknown'}</h4>
            <p>Connected: ${listener.connectedAt || 'Unknown'}</p>
            <p>Duration: ${listener.duration || 'Unknown'}</p>
            <p>User Agent: ${listener.userAgent || 'Unknown'}</p>
          </div>
        `);

        // Create a marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = '#3FB1CE';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';

        // Create and return the marker
        return new mapboxgl.Marker(el)
          .setLngLat([listener.geo.longitude, listener.geo.latitude])
          .setPopup(popup)
          .addTo(map.current);
      });

    setMarkers(newMarkers);

    // Fit the map to the markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      listeners
        .filter(listener => listener.geo && !listener.geo.error &&
                typeof listener.geo.latitude === 'number' &&
                typeof listener.geo.longitude === 'number' &&
                (listener.geo.latitude !== 0 || listener.geo.longitude !== 0))
        .forEach(listener => {
          bounds.extend([listener.geo.longitude, listener.geo.latitude]);
        });

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 9
      });
    }
  }, [listeners, isLoading, markers]);

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer ref={mapContainer} />
      {isLoading && (
        <LoadingOverlay>
          Loading listener data...
        </LoadingOverlay>
      )}
    </div>
  );
};

export default MapComponent;
