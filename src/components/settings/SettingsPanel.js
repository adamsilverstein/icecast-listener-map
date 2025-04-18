import React, { useState } from 'react';
import styled from 'styled-components';
import { clearGeoCache } from '../../services/geoService';

const SettingsContainer = styled.div`
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 15px;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? '#6c757d' : '#007bff'};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  margin-top: 10px;

  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#0069d9'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StatusText = styled.div`
  margin-top: 10px;
  font-style: italic;
  color: ${props => props.success ? '#28a745' : '#dc3545'};
`;

const SettingsPanel = ({
  refreshInterval,
  setRefreshInterval,
  onRefresh,
  lastUpdated,
  isLoading,
  listenerCount
}) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const handleRefreshIntervalChange = (e) => {
    setRefreshInterval(parseInt(e.target.value, 10));
  };

  const handleManualRefresh = () => {
    onRefresh();
    setStatusMessage('Manually refreshed data');
    setStatusType('success');

    // Clear status message after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  const handleClearCache = () => {
    clearGeoCache();
    setStatusMessage('Geolocation cache cleared');
    setStatusType('success');

    // Clear status message after 3 seconds
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);
  };

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';

    const date = new Date(lastUpdated);
    return date.toLocaleTimeString();
  };

  return (
    <SettingsContainer>
      <h3>Settings</h3>

      <SettingsGrid>
        <SettingsGroup>
          <Label htmlFor="refreshInterval">Auto-Refresh Interval:</Label>
          <Select
            id="refreshInterval"
            value={refreshInterval}
            onChange={handleRefreshIntervalChange}
            disabled={isLoading}
          >
            <option value={0}>Disabled</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
          </Select>
        </SettingsGroup>

        <SettingsGroup>
          <Label>Status:</Label>
          <div>
            {isLoading ? (
              <span>Loading data...</span>
            ) : (
              <>
                <span>Last updated: {formatLastUpdated()}</span>
                <br />
                <span>Active listeners: {listenerCount || 0}</span>
              </>
            )}
          </div>
        </SettingsGroup>
      </SettingsGrid>

      <ButtonGroup>
        <Button onClick={handleManualRefresh} disabled={isLoading}>
          Refresh Now
        </Button>
        <Button secondary onClick={handleClearCache} disabled={isLoading}>
          Clear Geolocation Cache
        </Button>
      </ButtonGroup>

      {statusMessage && (
        <StatusText success={statusType === 'success'}>
          {statusMessage}
        </StatusText>
      )}
    </SettingsContainer>
  );
};

export default SettingsPanel;
