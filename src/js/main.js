import Game from './Game.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Create multiplayer button
  const mpButtonContainer = document.createElement('div');
  mpButtonContainer.className = 'mp-button-container';
  mpButtonContainer.style.position = 'fixed';
  mpButtonContainer.style.top = '10px';
  mpButtonContainer.style.right = '10px';
  mpButtonContainer.style.zIndex = '100';
  
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
  
  mpButton.addEventListener('mouseenter', () => {
    mpButton.style.transform = 'scale(1.05)';
    mpButton.style.boxShadow = '0 0 15px rgba(12, 199, 199, 0.5)';
  });
  
  mpButton.addEventListener('mouseleave', () => {
    mpButton.style.transform = 'scale(1)';
    mpButton.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
  });
  
  mpButtonContainer.appendChild(mpButton);
  document.body.appendChild(mpButtonContainer);
  
  // Initialize the game
  const game = new Game();
  
  // Set up multiplayer button click handler
  mpButton.addEventListener('click', () => {
    // Load multiplayer components dynamically when needed
    import('./MultiplayerManager.js').then(MultiplayerManagerModule => {
      import('./MultiplayerUI.js').then(MultiplayerUIModule => {
        // Initialize multiplayer if not already initialized
        if (!window.multiplayerManager) {
          console.log("Initializing multiplayer components...");
          
          // Create new instances
          const MultiplayerManager = MultiplayerManagerModule.default;
          const MultiplayerUI = MultiplayerUIModule.default;
          
          const multiplayerManager = new MultiplayerManager();
          const multiplayerUI = new MultiplayerUI(multiplayerManager);
          
          // Initialize the UI and show it
          multiplayerUI.toggle();
          
          // Store for future access
          window.multiplayerManager = multiplayerManager;
          window.multiplayerUI = multiplayerUI;
          
          console.log("Multiplayer initialized.");
        } else {
          // Just toggle existing UI
          window.multiplayerUI.toggle();
        }
      }).catch(err => {
        console.error("Failed to load multiplayer UI:", err);
        alert("Could not initialize multiplayer. See console for details.");
      });
    }).catch(err => {
      console.error("Failed to load multiplayer manager:", err);
      alert("Could not initialize multiplayer. See console for details.");
    });
  });
  
  // Expose game to window for debugging purposes (can be removed in production)
  window.game = game;
});
