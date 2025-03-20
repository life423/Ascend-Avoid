// This file provides backward compatibility with the old app structure
// It redirects to the main module version in src/js/main.js

// Show a console message to help with debugging
console.log('Using app.js wrapper - redirecting to src/js/main.js');

// Load the module version
import('./src/js/main.js')
  .then(() => {
    console.log('Successfully loaded game from src/js/main.js');
  })
  .catch(error => {
    console.error('Failed to load game module:', error);
    document.body.innerHTML += `<div style="color: red; padding: 20px;">
      <h2>Error Loading Game</h2>
      <p>There was a problem loading the game. Please try the <a href="src/index.html">main version here</a>.</p>
      <pre>${error.message}</pre>
    </div>`;
  });
