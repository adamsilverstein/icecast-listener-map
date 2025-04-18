/**
 * Generates an iframe embed code for the Icecast Listener Map
 * @param {Object} options - Configuration options for the embed
 * @param {string} options.url - The URL of the deployed application
 * @param {number} options.width - The width of the iframe (default: 800)
 * @param {number} options.height - The height of the iframe (default: 600)
 * @param {boolean} options.allowFullscreen - Whether to allow fullscreen (default: true)
 * @returns {string} - The HTML iframe code
 */
export const generateEmbedCode = (options = {}) => {
  const {
    url = window.location.href,
    width = 800,
    height = 600,
    allowFullscreen = true
  } = options;

  return `<iframe
  src="${url}"
  width="${width}"
  height="${height}"
  frameborder="0"
  ${allowFullscreen ? 'allowfullscreen' : ''}
  style="border: 1px solid #ddd; border-radius: 4px;"
></iframe>`;
};

/**
 * Generates WordPress shortcode for embedding the Icecast Listener Map
 * @param {Object} options - Configuration options for the embed
 * @param {string} options.url - The URL of the deployed application
 * @param {number} options.width - The width of the iframe (default: 800)
 * @param {number} options.height - The height of the iframe (default: 600)
 * @returns {string} - The WordPress shortcode
 */
export const generateWordPressShortcode = (options = {}) => {
  const {
    url = window.location.href,
    width = 800,
    height = 600
  } = options;

  return `[icecast_listener_map url="${url}" width="${width}" height="${height}"]`;
};

/**
 * Example WordPress plugin code for the Icecast Listener Map
 * This is for reference only and would be implemented as a separate WordPress plugin
 */
export const wordPressPluginExample = `<?php
/**
 * Plugin Name: Icecast Listener Map
 * Description: Embeds an Icecast Listener Map in your WordPress site
 * Version: 1.0.0
 * Author: Your Name
 */

// Register shortcode
function icecast_listener_map_shortcode($atts) {
    // Default attributes
    $attributes = shortcode_atts(array(
        'url' => 'https://your-deployed-app-url.com',
        'width' => '800',
        'height' => '600'
    ), $atts);

    // Generate iframe HTML
    return '<iframe
        src="' . esc_url($attributes['url']) . '"
        width="' . esc_attr($attributes['width']) . '"
        height="' . esc_attr($attributes['height']) . '"
        frameborder="0"
        allowfullscreen
        style="border: 1px solid #ddd; border-radius: 4px;"
    ></iframe>';
}
add_shortcode('icecast_listener_map', 'icecast_listener_map_shortcode');
`;

/**
 * Detects if the application is running in an iframe
 * @returns {boolean} - True if running in an iframe, false otherwise
 */
export const isEmbedded = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

/**
 * Adjusts the application's styling when embedded
 * This can be called in the main App component to make adjustments when embedded
 */
export const applyEmbedStyles = () => {
  if (isEmbedded()) {
    // Apply any specific styles for embedded mode
    document.body.classList.add('embedded');

    // You can add additional embedded-specific styling here
    const style = document.createElement('style');
    style.textContent = `
      body.embedded {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      body.embedded .embed-hide {
        display: none !important;
      }

      body.embedded .app-container {
        border: none;
        box-shadow: none;
      }
    `;
    document.head.appendChild(style);
  }
};
