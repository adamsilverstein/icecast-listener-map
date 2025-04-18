# Icecast Listener Map

A React application that displays a map showing the geographic locations of listeners to an Icecast server. This application can be embedded into any website, including WordPress sites.

![Icecast Listener Map Screenshot](screenshot.png)

## Features

- **Real-time Listener Visualization**: Display listener locations on an interactive map
- **Multiple Authentication Methods**: Support for environment variables, stored credentials, or manual input
- **Auto-refresh**: Configurable refresh intervals to keep the map up-to-date
- **IP Geolocation Caching**: Efficient caching system to minimize API calls
- **Embedding Support**: Easy embedding in any website with iframe or WordPress shortcode
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/icecast-listener-map.git
   cd icecast-listener-map
   ```

2. Install dependencies for both the React app and the proxy server:
   ```
   npm run install-all
   ```

3. Start both the React app and the proxy server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The proxy server will run on port 3001 and handle requests to the Icecast server.

## Configuration

### Environment Variables

You can set the following environment variables for authentication:

- `REACT_APP_ICECAST_USERNAME`: Your Icecast server admin username
- `REACT_APP_ICECAST_PASSWORD`: Your Icecast server admin password

Create a `.env` file in the root directory:

```
REACT_APP_ICECAST_USERNAME=your_username
REACT_APP_ICECAST_PASSWORD=your_password
```

### Mapbox Token

The application uses a public Mapbox token with restricted usage. For production use, replace the token in `src/components/map/MapComponent.js` with your own:

```javascript
const MAPBOX_TOKEN = 'your_mapbox_token';
```

## Usage

### Authentication

The application supports three authentication methods:

1. **Environment Variables**: Set `REACT_APP_ICECAST_USERNAME` and `REACT_APP_ICECAST_PASSWORD`
2. **Stored Credentials**: Save credentials in the browser's local storage
3. **Manual Input**: Enter credentials each time you use the application

### Settings

- **Auto-Refresh Interval**: Set how often the listener data is refreshed
- **Manual Refresh**: Refresh the data immediately
- **Clear Geolocation Cache**: Clear the cached IP geolocation data

### Embedding

The application provides several embedding options:

1. **HTML Iframe**: Embed in any website using an iframe
2. **WordPress Shortcode**: Use a shortcode if you have the WordPress plugin installed
3. **WordPress Plugin**: Create a WordPress plugin using the provided code

## Icecast Server Compatibility

This application is designed to work with Icecast 2.x servers. It connects to the admin interface at:

```
https://your-icecast-server:port/admin/listclients.xsl?mount=/your-mount-point
```

The default mount point is set to `/live` but can be modified in `src/services/icecastService.js`.

## IP Geolocation

The application uses free geolocation services:

- Primary: [ipapi.co](https://ipapi.co)
- Fallback: [ipinfo.io](https://ipinfo.io)

Both services have rate limits on their free tiers. The application implements caching to minimize API calls.

## Building for Production

```
npm run build
```

This creates a production-ready build in the `build` folder that can be deployed to any static hosting service.

## License

MIT

## Acknowledgements

- [React](https://reactjs.org/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Styled Components](https://styled-components.com/)
- [Axios](https://axios-http.com/)
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)
