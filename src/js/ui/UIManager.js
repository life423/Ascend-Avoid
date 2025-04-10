/**
 * Manages all UI elements and DOM updates, keeping them separate
 * from game logic for better code organization.
 * Moved from root to ui/ directory for better organization.
 */
export default class UIManager {
  /**
   * Creates a new UIManager
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.scoreElement - Element for displaying score
   * @param {HTMLElement} options.highScoreElement - Element for displaying high score
   * @param {GameConfig} options.config - Game configuration
   */
  constructor({ scoreElement, highScoreElement, config }) {
    this.scoreElement = scoreElement;
    this.highScoreElement = highScoreElement;
    this.config = config;
    
    // Game over overlay elements (created on-demand)
    this.gameOverOverlay = null;
    
    // Save original title
    this.originalTitle = document.title;
  }
  
  /**
   * Update the score display
   * @param {number} score - Current score to display
   */
  updateScore(score) {
    if (this.scoreElement) {
      this.scoreElement.innerHTML = score;
    }
  }
  
  /**
   * Update the high score display
   * @param {number} highScore - High score to display
   */
  updateHighScore(highScore) {
    if (this.highScoreElement) {
      this.highScoreElement.innerHTML = highScore;
      
      // Also update page title to show achievement
      if (highScore > 0) {
        document.title = `${this.originalTitle} - High Score: ${highScore}`;
      }
    }
  }
  
  /**
   * Show the game over screen
   * @param {number} finalScore - Final score achieved
   * @param {number} highScore - Current high score
   * @param {Function} onRestart - Callback function when restart is clicked
   * @param {string} [winnerName] - Name of winner in multiplayer mode
   * @param {boolean} [isWinner] - Whether the local player is the winner
   */
  showGameOver(finalScore, highScore, onRestart, winnerName, isWinner) {
    // Create overlay if it doesn't exist
    if (!this.gameOverOverlay) {
      this.createGameOverOverlay();
    }
    
    // Update title based on game mode
    const titleElement = this.gameOverOverlay.querySelector('h2');
    if (titleElement) {
      if (winnerName) {
        // Multiplayer mode
        titleElement.textContent = isWinner ? 'Victory!' : 'Game Over';
      } else {
        // Single player mode
        titleElement.textContent = 'Game Over';
      }
    }
    
    // Update content
    const scoreDisplay = this.gameOverOverlay.querySelector('.game-over-score');
    if (scoreDisplay) {
      scoreDisplay.textContent = finalScore;
    }
    
    const highScoreDisplay = this.gameOverOverlay.querySelector('.game-over-highscore');
    if (highScoreDisplay) {
      highScoreDisplay.textContent = highScore;
    }
    
    // Handle multiplayer result
    const multiplayerResultElement = this.gameOverOverlay.querySelector('.multiplayer-result');
    if (multiplayerResultElement) {
      if (winnerName) {
        // Show multiplayer result
        multiplayerResultElement.textContent = isWinner 
          ? 'You were the last one standing!' 
          : `${winnerName} was the last one standing!`;
        multiplayerResultElement.style.display = 'block';
      } else {
        // Hide multiplayer result in single player mode
        multiplayerResultElement.style.display = 'none';
      }
    }
    
    // Set restart button callback
    const restartButton = this.gameOverOverlay.querySelector('.game-over-restart');
    if (restartButton) {
      // Remove any existing listeners (to prevent duplicates)
      const newButton = restartButton.cloneNode(true);
      restartButton.parentNode.replaceChild(newButton, restartButton);
      
      // Add new listener
      newButton.addEventListener('click', () => {
        this.hideGameOver();
        if (onRestart) onRestart();
      });
    }
    
    // Show the overlay
    this.gameOverOverlay.style.display = 'flex';
    
    // Add event listener for pressing 'R' to restart
    const handleKeyDown = (e) => {
      if (this.config.getKeys().RESTART.includes(e.key)) {
        this.hideGameOver();
        document.removeEventListener('keydown', handleKeyDown);
        if (onRestart) onRestart();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
  }
  
  /**
   * Hide the game over screen
   */
  hideGameOver() {
    if (this.gameOverOverlay) {
      this.gameOverOverlay.style.display = 'none';
    }
  }
  
  /**
   * Create the game over overlay elements
   */
  createGameOverOverlay() {
    // Create overlay container
    this.gameOverOverlay = document.createElement('div');
    this.gameOverOverlay.className = 'game-over-overlay';
    
    // Create content
    this.gameOverOverlay.innerHTML = `
      <div class="game-over-content">
        <h2>Game Over</h2>
        <div class="game-over-stats">
          <p>Score: <span class="game-over-score">0</span></p>
          <p>High Score: <span class="game-over-highscore">0</span></p>
        </div>
        <p class="multiplayer-result"></p>
        <button class="game-over-restart">Play Again</button>
        <p class="game-over-hint">Press 'R' to restart</p>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .game-over-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      .game-over-content {
        background: rgba(10, 35, 66, 0.9);
        border: 2px solid var(--primary-color);
        border-radius: 8px;
        padding: 30px;
        text-align: center;
        color: white;
        box-shadow: 0 0 30px var(--primary-glow);
        max-width: 90%;
        width: 400px;
      }
      
      .game-over-content h2 {
        color: var(--primary-color);
        font-size: 36px;
        margin-top: 0;
      }
      
      .game-over-stats {
        margin: 20px 0;
        font-size: 20px;
      }
      
      .game-over-score, .game-over-highscore {
        color: var(--primary-color);
        font-weight: bold;
      }
      
      .multiplayer-result {
        margin: 15px 0;
        font-size: 18px;
        color: #ffcc00;
        font-weight: bold;
        display: none;
      }
      
      .game-over-restart {
        background: var(--primary-color);
        color: #000;
        border: none;
        padding: 12px 24px;
        font-size: 18px;
        border-radius: 4px;
        cursor: pointer;
        margin: 20px 0;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      
      .game-over-restart:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px var(--primary-glow);
      }
      
      .game-over-hint {
        color: #aaa;
        font-size: 14px;
        margin-bottom: 0;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.gameOverOverlay);
  }
  
  /**
   * Create a visual flash effect on the screen (e.g., for collisions)
   * @param {string} color - Color of the flash
   * @param {number} duration - Duration of flash in milliseconds
   */
  flashScreen(color = '#ff0000', duration = 200) {
    // Create a flash overlay if it doesn't exist
    if (!this.flashOverlay) {
      this.flashOverlay = document.createElement('div');
      this.flashOverlay.className = 'screen-flash';
      this.flashOverlay.style.position = 'fixed';
      this.flashOverlay.style.top = '0';
      this.flashOverlay.style.left = '0';
      this.flashOverlay.style.width = '100%';
      this.flashOverlay.style.height = '100%';
      this.flashOverlay.style.pointerEvents = 'none'; // Don't block clicks
      this.flashOverlay.style.transition = 'opacity 0.1s ease-out';
      this.flashOverlay.style.opacity = '0';
      this.flashOverlay.style.zIndex = '999'; // Below game-over overlay
      document.body.appendChild(this.flashOverlay);
    }
    
    // Set color and fade in
    this.flashOverlay.style.backgroundColor = color;
    this.flashOverlay.style.opacity = '0.5';
    
    // Fade out after duration
    setTimeout(() => {
      this.flashOverlay.style.opacity = '0';
    }, duration);
  }
  
  /**
   * Create and show a loading screen
   * @param {string} message - Loading message to display
   */
  showLoading(message = 'Loading...') {
    if (!this.loadingOverlay) {
      this.loadingOverlay = document.createElement('div');
      this.loadingOverlay.className = 'loading-overlay';
      this.loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p class="loading-message">${message}</p>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(10, 26, 47, 0.9);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1001;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(12, 199, 199, 0.3);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading-message {
          margin-top: 20px;
          color: var(--primary-color);
          font-size: 18px;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(this.loadingOverlay);
    } else {
      // Update message if loading is already showing
      const msgElement = this.loadingOverlay.querySelector('.loading-message');
      if (msgElement) {
        msgElement.textContent = message;
      }
      this.loadingOverlay.style.display = 'flex';
    }
  }
  
  /**
   * Hide the loading screen
   */
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = 'none';
    }
  }
  
  /**
   * Show an error message to the user
   * @param {string} title - The error title
   * @param {string} message - The error message
   * @param {Function} [onClose] - Callback when error is closed
   */
  showError(title, message, onClose) {
    // Create error overlay if it doesn't exist
    if (!this.errorOverlay) {
      this.errorOverlay = document.createElement('div');
      this.errorOverlay.className = 'error-overlay';
      this.errorOverlay.innerHTML = `
        <div class="error-content">
          <h3 class="error-title">Error</h3>
          <p class="error-message"></p>
          <button class="error-close">OK</button>
        </div>
      `;
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .error-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1002;
        }
        
        .error-content {
          background: rgba(47, 18, 18, 0.95);
          border: 2px solid #ff4757;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          color: white;
          max-width: 90%;
          width: 400px;
        }
        
        .error-title {
          color: #ff4757;
          font-size: 24px;
          margin-top: 0;
        }
        
        .error-message {
          margin: 20px 0;
          line-height: 1.5;
        }
        
        .error-close {
          background: #ff4757;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .error-close:hover {
          background: #ff6b81;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(this.errorOverlay);
    }
    
    // Update content
    const titleElement = this.errorOverlay.querySelector('.error-title');
    if (titleElement) {
      titleElement.textContent = title || 'Error';
    }
    
    const messageElement = this.errorOverlay.querySelector('.error-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    // Set up close button
    const closeButton = this.errorOverlay.querySelector('.error-close');
    if (closeButton) {
      // Remove existing listeners
      const newButton = closeButton.cloneNode(true);
      closeButton.parentNode.replaceChild(newButton, closeButton);
      
      // Add new listener
      newButton.addEventListener('click', () => {
        this.hideError();
        if (onClose) onClose();
      });
    }
    
    // Show the overlay
    this.errorOverlay.style.display = 'flex';
  }
  
  /**
   * Hide error message
   */
  hideError() {
    if (this.errorOverlay) {
      this.errorOverlay.style.display = 'none';
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove any DOM elements we created
    if (this.gameOverOverlay && this.gameOverOverlay.parentNode) {
      this.gameOverOverlay.parentNode.removeChild(this.gameOverOverlay);
    }
    
    if (this.flashOverlay && this.flashOverlay.parentNode) {
      this.flashOverlay.parentNode.removeChild(this.flashOverlay);
    }
    
    if (this.loadingOverlay && this.loadingOverlay.parentNode) {
      this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
    }
    
    if (this.errorOverlay && this.errorOverlay.parentNode) {
      this.errorOverlay.parentNode.removeChild(this.errorOverlay);
    }
    
    // Reset title
    document.title = this.originalTitle;
  }
}
