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

/**
 * Resize the canvas to match its display size
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 */
export function resizeCanvas(canvas) {
  // Get the width from CSS
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  
  // Check if the canvas is not the same size
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}
