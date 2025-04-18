import React, { useState } from 'react';
import styled from 'styled-components';
import { generateEmbedCode, generateWordPressShortcode, wordPressPluginExample } from '../../utils/embedHelper';

const EmbedContainer = styled.div`
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 15px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
`;

const Tab = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.active ? '#f8f9fa' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    background-color: #e9ecef;
  }
`;

const CodeBlock = styled.pre`
  background-color: #f1f1f1;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
`;

const InputGroup = styled.div`
  display: flex;
  margin-bottom: 15px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  font-weight: bold;
  margin-right: 10px;
  min-width: 100px;

  @media (max-width: 768px) {
    margin-bottom: 5px;
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #0069d9;
  }
`;

const CopyMessage = styled.div`
  margin-top: 10px;
  color: #28a745;
  font-style: italic;
`;

const EmbedInfo = () => {
  const [activeTab, setActiveTab] = useState('iframe');
  const [embedOptions, setEmbedOptions] = useState({
    url: window.location.href,
    width: 800,
    height: 600
  });
  const [copyMessage, setCopyMessage] = useState('');

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setEmbedOptions(prev => ({
      ...prev,
      [name]: name === 'width' || name === 'height' ? parseInt(value, 10) : value
    }));
  };

  const handleCopyCode = () => {
    let codeToCopy = '';

    switch (activeTab) {
      case 'iframe':
        codeToCopy = generateEmbedCode(embedOptions);
        break;
      case 'wordpress':
        codeToCopy = generateWordPressShortcode(embedOptions);
        break;
      case 'plugin':
        codeToCopy = wordPressPluginExample;
        break;
      default:
        codeToCopy = generateEmbedCode(embedOptions);
    }

    navigator.clipboard.writeText(codeToCopy)
      .then(() => {
        setCopyMessage('Code copied to clipboard!');
        setTimeout(() => setCopyMessage(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
        setCopyMessage('Failed to copy code. Please try again.');
        setTimeout(() => setCopyMessage(''), 3000);
      });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'iframe':
        return (
          <>
            <p>Use this HTML code to embed the Icecast Listener Map in any website:</p>
            <CodeBlock>{generateEmbedCode(embedOptions)}</CodeBlock>
          </>
        );
      case 'wordpress':
        return (
          <>
            <p>Use this shortcode to embed the map in a WordPress site:</p>
            <CodeBlock>{generateWordPressShortcode(embedOptions)}</CodeBlock>
            <p>Note: This requires the Icecast Listener Map WordPress plugin to be installed.</p>
          </>
        );
      case 'plugin':
        return (
          <>
            <p>Create a WordPress plugin with this code to enable the shortcode:</p>
            <CodeBlock>{wordPressPluginExample}</CodeBlock>
            <p>Save this as a PHP file in your WordPress plugins directory and activate it.</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <EmbedContainer>
      <h3>Embed Information</h3>

      <TabContainer>
        <Tab
          active={activeTab === 'iframe'}
          onClick={() => setActiveTab('iframe')}
        >
          HTML Iframe
        </Tab>
        <Tab
          active={activeTab === 'wordpress'}
          onClick={() => setActiveTab('wordpress')}
        >
          WordPress Shortcode
        </Tab>
        <Tab
          active={activeTab === 'plugin'}
          onClick={() => setActiveTab('plugin')}
        >
          WordPress Plugin
        </Tab>
      </TabContainer>

      {activeTab !== 'plugin' && (
        <div>
          <InputGroup>
            <Label htmlFor="url">URL:</Label>
            <Input
              type="text"
              id="url"
              name="url"
              value={embedOptions.url}
              onChange={handleOptionChange}
              placeholder="https://your-app-url.com"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="width">Width:</Label>
            <Input
              type="number"
              id="width"
              name="width"
              value={embedOptions.width}
              onChange={handleOptionChange}
              min="200"
              max="2000"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="height">Height:</Label>
            <Input
              type="number"
              id="height"
              name="height"
              value={embedOptions.height}
              onChange={handleOptionChange}
              min="200"
              max="2000"
            />
          </InputGroup>
        </div>
      )}

      {renderTabContent()}

      <Button onClick={handleCopyCode}>
        Copy Code
      </Button>

      {copyMessage && (
        <CopyMessage>{copyMessage}</CopyMessage>
      )}
    </EmbedContainer>
  );
};

export default EmbedInfo;
