import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AuthFormContainer = styled.div`
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const AuthMethodSelector = styled.div`
  margin-bottom: 15px;
`;

const AuthForm = ({ onAuthenticate }) => {
  const [authMethod, setAuthMethod] = useState('form');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored credentials on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('icecast_username');
    const storedPassword = localStorage.getItem('icecast_password');

    // Check for environment variables first
    if (process.env.REACT_APP_ICECAST_USERNAME && process.env.REACT_APP_ICECAST_PASSWORD) {
      setAuthMethod('env');
      setIsAuthenticated(true);
      onAuthenticate({
        username: process.env.REACT_APP_ICECAST_USERNAME,
        password: process.env.REACT_APP_ICECAST_PASSWORD
      });
    }
    // Then check for stored credentials
    else if (storedUsername && storedPassword) {
      setAuthMethod('stored');
      setUsername(storedUsername);
      setPassword(storedPassword);
      setIsAuthenticated(true);
      onAuthenticate({ username: storedUsername, password: storedPassword });
    }
  }, [onAuthenticate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username && password) {
      // Store credentials if remember is checked
      if (rememberCredentials) {
        localStorage.setItem('icecast_username', username);
        localStorage.setItem('icecast_password', password);
      }

      setIsAuthenticated(true);
      onAuthenticate({ username, password });
    }
  };

  const handleAuthMethodChange = (method) => {
    setAuthMethod(method);

    // Clear authentication state when changing methods
    if (method === 'form' && isAuthenticated) {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    if (authMethod === 'stored') {
      localStorage.removeItem('icecast_username');
      localStorage.removeItem('icecast_password');
    }

    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setAuthMethod('form');
    onAuthenticate(null);
  };

  return (
    <AuthFormContainer>
      <h3>Icecast Server Authentication</h3>

      {isAuthenticated ? (
        <div>
          <p>
            {authMethod === 'env'
              ? 'Using environment variables for authentication'
              : authMethod === 'stored'
                ? 'Using stored credentials'
                : 'Authenticated with provided credentials'}
          </p>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <>
          <AuthMethodSelector>
            <Label>Authentication Method:</Label>
            <select
              value={authMethod}
              onChange={(e) => handleAuthMethodChange(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', width: '100%' }}
            >
              <option value="form">Manual Input</option>
              <option value="env">Environment Variables</option>
              <option value="stored">Stored Credentials</option>
            </select>
          </AuthMethodSelector>

          {authMethod === 'form' && (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="username">Username:</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password:</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>

              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id="remember"
                  checked={rememberCredentials}
                  onChange={(e) => setRememberCredentials(e.target.checked)}
                />
                <Label htmlFor="remember" style={{ margin: 0 }}>Remember credentials</Label>
              </CheckboxContainer>

              <Button type="submit">Login</Button>
            </Form>
          )}

          {authMethod === 'env' && (
            <p>
              Set REACT_APP_ICECAST_USERNAME and REACT_APP_ICECAST_PASSWORD environment variables
              to use this method. These variables are not currently set.
            </p>
          )}

          {authMethod === 'stored' && (
            <p>No stored credentials found. Please use manual input first.</p>
          )}
        </>
      )}
    </AuthFormContainer>
  );
};

export default AuthForm;
