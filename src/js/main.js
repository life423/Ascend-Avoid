/**
 * Main application entry point
 * Handles game initialization and responsive layout
 */
import Game from './Game.js';
import ResponsiveManager from './managers/ResponsiveManager.js';

// Add buffer polyfill for Colyseus (needed for multiplayer)
import { Buffer } from 'buffer';

try {
  // Check if we're running in browser and Buffer isn't defined
  if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
    console.log('Buffer not available in browser, adding polyfill for multiplayer');
    window.Buffer = Buffer;
  }
} catch (e) {
  console.warn('Error setting up Buffer polyfill:', e);
}
// Use inline device detection to avoid import issues
function detectDevice() {
  return {
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1200,
    isDesktop: window.innerWidth >= 1200,
    isLandscape: window.innerWidth > window.innerHeight
  };
}

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cross the Box game...');
  
  // Show initial loading indicator if it exists
  const loader = document.querySelector('.loader');
  
  // Detect device capabilities for initial setup
  const deviceInfo = detectDevice();
  console.log(`Device detected: ${deviceInfo.isDesktop ? 'Desktop' : deviceInfo.isTablet ? 'Tablet' : 'Mobile'}`);
  console.log(`Touch support: ${deviceInfo.isTouchDevice ? 'Yes' : 'No'}`);
  
  // Apply any device-specific initial body classes
  const body = document.body;
  if (deviceInfo.isDesktop) {
    body.classList.add('desktop-layout');
  }
  if (deviceInfo.isLandscape) {
    body.classList.add('landscape');
  } else {
    body.classList.add('portrait');
  }
  
  // Create multiplayer button with proper styling
  createMultiplayerButton();
  
  // Initialize the game
  const game = new Game();
  
  // Get the canvas element
  const canvas = document.getElementById('canvas');
  
  // Initialize ResponsiveManager with the game instance
  const responsiveManager = new ResponsiveManager(game);
  
  // Initialize with canvas
  if (responsiveManager && canvas) {
    responsiveManager.init(canvas);
    console.log('ResponsiveManager initialized with canvas');
  } else {
    console.error('Failed to initialize ResponsiveManager:', 
      !responsiveManager ? 'ResponsiveManager not found' : 'Canvas not found');
  }
  
  // Store references for debugging and future use
  window.game = game;
  window.responsiveManager = responsiveManager;
  
  // Remove loading indicator after initialization
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }, 300);
  }
  
  console.log('Game initialized successfully');
});

/**
 * Creates styled multiplayer button with proper responsive behavior
 */
function createMultiplayerButton() {
  // Create multiplayer button container
  const mpButtonContainer = document.createElement('div');
  mpButtonContainer.className = 'mp-button-container';
  mpButtonContainer.style.position = 'fixed';
  mpButtonContainer.style.top = '10px';
  mpButtonContainer.style.right = '10px';
  mpButtonContainer.style.zIndex = '100';
  
  // Create the button element
  const mpButton = document.createElement('button');
  mpButton.textContent = 'Multiplayer';
  mpButton.className = 'multiplayer-button';
  mpButton.style.background = '#0CC7C7';
  mpButton.style.color = 'black';
  mpButton.style.border = 'none';
  mpButton.style.padding = '10px 15px';
  mpButton.style.borderRadius = '4px';
  mpButton.style.fontWeight = 'bold';
  mpButton.style.cursor = 'pointer';
  mpButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  mpButton.style.transition = 'all 0.2s ease';
  
  // Add button hover effects
  mpButton.addEventListener('mouseenter', () => {
    mpButton.style.transform = 'scale(1.05)';
    mpButton.style.boxShadow = '0 0 15px rgba(12, 199, 199, 0.5)';
  });
  
  mpButton.addEventListener('mouseleave', () => {
    mpButton.style.transform = 'scale(1)';
    mpButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  });
  
  // Make button responsive on smaller screens
  const mediaQuery = window.matchMedia('(max-width: 600px)');
  function updateButtonSize(mq) {
    if (mq.matches) {
      // Smaller button on mobile
      mpButton.style.padding = '8px 12px';
      mpButton.style.fontSize = '0.9rem';
    } else {
      // Regular size on desktop
      mpButton.style.padding = '10px 15px';
      mpButton.style.fontSize = '1rem';
    }
  }
  
  // Initialize button size based on screen
  updateButtonSize(mediaQuery);
  
  // Update button when screen size changes
  mediaQuery.addEventListener('change', updateButtonSize);
  
  // Add click handler to initialize multiplayer
  mpButton.addEventListener('click', initializeMultiplayer);
  
  // Add button to container and container to document
  mpButtonContainer.appendChild(mpButton);
  document.body.appendChild(mpButtonContainer);
}

/**
 * Initializes multiplayer functionality on demand using the Game mode system
 * Delegates to Game.switchGameMode for proper mode initialization
 */
function initializeMultiplayer() {
  // Get button and game reference
  const mpButton = document.querySelector('.multiplayer-button');
  const game = window.game;
  
  // Ensure game instance exists
  if (!game) {
    console.error("Game instance not found. Cannot initialize multiplayer.");
    alert("Error: Game not initialized properly.");
    return;
  }
  
  // Show a loading state on button
  const originalText = mpButton.textContent;
  mpButton.textContent = 'Loading...';
  mpButton.style.opacity = '0.7';
  mpButton.disabled = true;
  
  // Check if we're already in multiplayer mode
  if (game.isMultiplayerMode) {
    // We're already in multiplayer mode, just show UI
    import('./ui/MultiplayerUI.js').then((MultiplayerUIModule) => {
      const MultiplayerUI = MultiplayerUIModule.default;
      
      // Create UI if it doesn't exist
      if (!window.multiplayerUI) {
        window.multiplayerUI = new MultiplayerUI(null); // We don't need manager here
      }
      
      // Show UI
      window.multiplayerUI.toggle();
      
      // Reset button
      mpButton.textContent = originalText;
      mpButton.style.opacity = '1';
      mpButton.disabled = false;
    });
    
    return;
  }
  
  // Switch to multiplayer mode
  game.switchGameMode('multiplayer')
    .then(() => {
      console.log("Switched to multiplayer mode successfully");
      
      // Reset button state
      mpButton.textContent = originalText;
      mpButton.style.opacity = '1';
      mpButton.disabled = false;
      
      // Load and show UI
      return import('./ui/MultiplayerUI.js');
    })
    .then((MultiplayerUIModule) => {
      const MultiplayerUI = MultiplayerUIModule.default;
      
      // Create UI
      window.multiplayerUI = new MultiplayerUI(null); // Game mode already has manager
      
      // Show UI
      window.multiplayerUI.toggle();
      
      console.log("Multiplayer UI initialized");
    })
    .catch(err => {
      // Reset button state
      mpButton.textContent = originalText;
      mpButton.style.opacity = '1';
      mpButton.disabled = false;
      
      // Show error
      console.error("Failed to initialize multiplayer:", err);
      alert("Could not initialize multiplayer. Please check your connection and try again.");
    });
}
