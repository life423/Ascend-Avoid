/**
 * Responsive Canvas Handler
 * This script makes the canvas fully responsive across all devices
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Get the canvas and its container
  const canvas = document.getElementById('canvas');
  const container = document.getElementById('game-container');
  
  if (!canvas || !container) {
    console.error('Canvas or container not found');
    return;
  }
  
  // Base dimensions (design target)
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 600;
  const BASE_ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;
  
  // Function to resize the canvas
  function resizeCanvas() {
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate dimensions that maintain aspect ratio
    let width, height;
    
    // Calculate container aspect ratio
    const containerAspectRatio = containerWidth / containerHeight;
    
    if (containerAspectRatio > BASE_ASPECT_RATIO) {
      // Container is wider than our target aspect ratio
      height = containerHeight;
      width = height * BASE_ASPECT_RATIO;
    } else {
      // Container is taller than our target aspect ratio
      width = containerWidth;
      height = width / BASE_ASPECT_RATIO;
    }
    
    // Set canvas display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Set canvas internal resolution with device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    
    // Scale the context to account for the pixel ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }
    
    // Store scaling information for game objects
    canvas.scalingInfo = {
      widthScale: width / BASE_WIDTH,
      heightScale: height / BASE_HEIGHT,
      pixelRatio: pixelRatio
    };
    
    // Update game scaling if game is initialized
    if (window.game && window.game.onResize) {
      window.game.onResize(
        width / BASE_WIDTH,
        height / BASE_HEIGHT,
        window.innerWidth >= 1024
      );
    }
    
    console.log(`Canvas resized: ${Math.round(width)}x${Math.round(height)}, ratio: ${pixelRatio}`);
  }
  
  // Set up container styles
  container.style.width = '100%';
  container.style.height = '80vh';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.overflow = 'hidden';
  
  // Set up canvas styles
  canvas.style.display = 'block';
  canvas.style.maxWidth = '100%';
  canvas.style.maxHeight = '100%';
  canvas.style.objectFit = 'contain';
  
  // Set up event listeners
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', function() {
    // Small delay to ensure orientation change completes
    setTimeout(resizeCanvas, 100);
  });
  
  // Handle orientation changes
  function handleOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    document.body.classList.toggle('portrait', isPortrait);
    document.body.classList.toggle('landscape', !isPortrait);
    
    // Show orientation message on mobile devices in portrait mode
    if (window.innerWidth < 768) {
      document.body.classList.toggle('show-orientation-message', isPortrait);
      
      // Adjust container height based on orientation
      container.style.height = isPortrait ? '60vh' : '80vh';
    }
  }
  
  // Listen for orientation changes
  window.matchMedia("(orientation: portrait)").addEventListener('change', handleOrientation);
  
  // Initial orientation setup
  handleOrientation();
  
  // Initial canvas sizing
  resizeCanvas();
});