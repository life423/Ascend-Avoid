import Game from './Game.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the game
  const game = new Game();
  
  // Expose game to window for debugging purposes (can be removed in production)
  window.game = game;
});
