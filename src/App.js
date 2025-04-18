import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import AuthForm from './components/auth/AuthForm';
import MapComponent from './components/map/MapComponent';
import SettingsPanel from './components/settings/SettingsPanel';
import EmbedInfo from './components/settings/EmbedInfo';
import { fetchListeners } from './services/icecastService';
import { geolocateListeners } from './services/geoService';
import { applyEmbedStyles, isEmbedded } from './utils/embedHelper';
import './App.css';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const AppHeader = styled.header`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const Subtitle = styled.p`
  margin: 5px 0 0;
  color: #666;
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

function App() {
  const [credentials, setCredentials] = useState(null);
  const [listeners, setListeners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds default
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimerRef = useRef(null);

  // Apply embedded styles if running in an iframe
  useEffect(() => {
    applyEmbedStyles();
  }, []);

  // Function to fetch and process listener data
  const fetchData = useCallback(async () => {
    if (!credentials) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch listeners from the Icecast server
      const listenerData = await fetchListeners(credentials);

      // Geolocate the listeners
      const geolocatedListeners = await geolocateListeners(listenerData);

      setListeners(geolocatedListeners);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Error fetching listener data:', err);
      setError(err.message || 'Failed to fetch listener data');
    } finally {
      setIsLoading(false);
    }
  }, [credentials]);

  // Set up auto-refresh
  useEffect(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Set up new timer if interval is greater than 0
    if (refreshInterval > 0 && credentials) {
      refreshTimerRef.current = setInterval(fetchData, refreshInterval);

      // Clean up on unmount
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
      };
    }
  }, [refreshInterval, credentials, fetchData]);

  // Initial data fetch when credentials are provided
  useEffect(() => {
    if (credentials) {
      fetchData();
    }
  }, [credentials, fetchData]);

  // Handle authentication
  const handleAuthenticate = (newCredentials) => {
    setCredentials(newCredentials);

    // Clear listeners if credentials are removed
    if (!newCredentials) {
      setListeners([]);
      setLastUpdated(null);
    }
  };

  // Determine if we should show the embed info (not when embedded)
  const showEmbedInfo = !isEmbedded();

  return (
    <AppContainer className="app-container">
      <AppHeader className={isEmbedded() ? 'embed-hide' : ''}>
        <div>
          <Title>Icecast Listener Map</Title>
          <Subtitle>Visualize your stream listeners around the world</Subtitle>
        </div>
      </AppHeader>

      <ContentContainer>
        <AuthForm onAuthenticate={handleAuthenticate} />

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <SettingsPanel
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          onRefresh={fetchData}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          listenerCount={listeners.length}
        />

        <MapComponent
          listeners={listeners}
          isLoading={isLoading}
        />

        {showEmbedInfo && (
          <EmbedInfo />
        )}
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
