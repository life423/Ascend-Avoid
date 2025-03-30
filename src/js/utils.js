/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer between min and max
 */
export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Singleton audio context to avoid multiple instances
let audioContext = null;

/**
 * Play a simple sound effect
 * @param {string} type - The type of sound ('collision', 'score', etc.)
 */
export function playSound(type) {
  // Don't attempt sound on browsers that don't support AudioContext
  if (!(window.AudioContext || window.webkitAudioContext)) {
    return;
  }
  
  try {
    // Create AudioContext only once
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.log("Failed to create AudioContext:", e);
        return; // Exit if we can't create the context
      }
    }
    
    // Don't proceed if audio context is in a bad state
    if (audioContext.state === 'suspended' || audioContext.state === 'closed') {
      try {
        audioContext.resume();
      } catch (e) {
        console.log("Failed to resume AudioContext:", e);
        return;
      }
    }
    
    // Create gain node to control volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.1; // Lower volume
    gainNode.connect(audioContext.destination);
    
    // Create and configure oscillator
    const oscillator = audioContext.createOscillator();
    
    switch (type) {
      case 'collision':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
        break;
      case 'score':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
        break;
      default:
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
    }
    
    // Connect to gain node instead of directly to destination
    oscillator.connect(gainNode);
    
    // Add fade out
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    // Play the sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.log("Error playing sound:", e);
  }
}

// Global scaling factor for game elements
export let SCALE_FACTOR = 1;
// Base canvas dimensions - will be used as a reference for scaling
export const BASE_CANVAS_WIDTH = 560;
export const BASE_CANVAS_HEIGHT = 550;
// Aspect ratio of the game
export const ASPECT_RATIO = BASE_CANVAS_HEIGHT / BASE_CANVAS_WIDTH;

/**
 * Resize the canvas to be responsive while maintaining aspect ratio
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @returns {Object} The scale factors for width and height
 */
export function resizeCanvas(canvas) {
  // Get the container dimensions
  const container = canvas.parentElement;
  const containerWidth = container.clientWidth;
  
  // Calculate optimal canvas size based on container
  let canvasWidth = Math.min(containerWidth, window.innerWidth * 0.95);
  
  // For very small screens, ensure minimum usable size
  canvasWidth = Math.max(canvasWidth, 280);
  
  // Calculate height based on aspect ratio
  let canvasHeight = canvasWidth * ASPECT_RATIO;
  
  // Check if height exceeds window height (minus some margin for UI)
  const maxHeight = window.innerHeight * 0.7;
  if (canvasHeight > maxHeight) {
    canvasHeight = maxHeight;
    canvasWidth = canvasHeight / ASPECT_RATIO;
  }
  
  // Apply the dimensions
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  
  // Set actual canvas resolution to match display size
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Calculate scaling factors for game elements
  SCALE_FACTOR = canvasWidth / BASE_CANVAS_WIDTH;
  
  return {
    widthScale: canvasWidth / BASE_CANVAS_WIDTH,
    heightScale: canvasHeight / BASE_CANVAS_HEIGHT
  };
}
