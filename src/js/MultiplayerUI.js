import { GAME_CONSTANTS, PLAYER_COLORS } from "../../shared/constants/gameConstants.js";

/**
 * Handles UI elements for multiplayer mode
 */
export default class MultiplayerUI {
  constructor(multiplayerManager) {
    this.multiplayerManager = multiplayerManager;
    this.isVisible = false;
    this.gameContainer = document.getElementById('wrapper');
    
    // References to UI elements
    this.multiplayerContainer = null;
    this.lobbyContainer = null;
    this.gameStatusContainer = null;
    this.playerListContainer = null;
    this.connectButton = null;
    this.disconnectButton = null;
    this.playerNameInput = null;
    this.serverAddressInput = null;
    this.countdownDisplay = null;
    this.playerCountDisplay = null;
    this.gameStatusDisplay = null;
    this.arenaIndicator = null;
    
    // Initialize UI elements
    this.init();
  }
  
  /**
   * Initialize UI elements
   */
  init() {
    // Create main container
    this.multiplayerContainer = document.createElement('div');
    this.multiplayerContainer.id = 'multiplayer-container';
    this.multiplayerContainer.className = 'multiplayer-container';
    
    // Create lobby UI
    this.createLobbyUI();
    
    // Create game status UI
    this.createGameStatusUI();
    
    // Create player list UI
    this.createPlayerListUI();
    
    // Create arena indicator
    this.createArenaIndicator();
    
    // Add to DOM
    document.body.appendChild(this.multiplayerContainer);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Add styles
    this.addStyles();
    
    // Hide initially
    this.hide();
  }
  
  /**
   * Create lobby UI elements
   */
  createLobbyUI() {
    this.lobbyContainer = document.createElement('div');
    this.lobbyContainer.className = 'multiplayer-lobby';
    
    // Create header
    const header = document.createElement('h2');
    header.textContent = 'Multiplayer Mode';
    this.lobbyContainer.appendChild(header);
    
    // Create form
    const form = document.createElement('div');
    form.className = 'multiplayer-form';
    
    // Player name input
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Your Name:';
    this.playerNameInput = document.createElement('input');
    this.playerNameInput.type = 'text';
    this.playerNameInput.value = 'Player' + Math.floor(Math.random() * 1000);
    nameLabel.appendChild(this.playerNameInput);
    form.appendChild(nameLabel);
    
    // Server address input
    const serverLabel = document.createElement('label');
    serverLabel.textContent = 'Server:';
    this.serverAddressInput = document.createElement('input');
    this.serverAddressInput.type = 'text';
    this.serverAddressInput.value = 'ws://localhost:3000';
    serverLabel.appendChild(this.serverAddressInput);
    form.appendChild(serverLabel);
    
    // Connect button
    this.connectButton = document.createElement('button');
    this.connectButton.textContent = 'Connect';
    this.connectButton.className = 'connect-button';
    form.appendChild(this.connectButton);
    
    // Disconnect button
    this.disconnectButton = document.createElement('button');
    this.disconnectButton.textContent = 'Disconnect';
    this.disconnectButton.className = 'disconnect-button';
    this.disconnectButton.style.display = 'none';
    form.appendChild(this.disconnectButton);
    
    this.lobbyContainer.appendChild(form);
    
    // Game description
    const description = document.createElement('div');
    description.className = 'multiplayer-description';
    description.innerHTML = `
      <h3>Last Player Standing Mode</h3>
      <p>In this multiplayer mode, up to 30 players compete to be the last one alive!</p>
      <ul>
        <li>Avoid hitting obstacles and other players</li>
        <li>The playing field shrinks over time</li>
        <li>If you hit an obstacle or leave the arena, you're eliminated</li>
        <li>The last player alive wins!</li>
      </ul>
    `;
    this.lobbyContainer.appendChild(description);
    
    this.multiplayerContainer.appendChild(this.lobbyContainer);
  }
  
  /**
   * Create game status UI elements
   */
  createGameStatusUI() {
    this.gameStatusContainer = document.createElement('div');
    this.gameStatusContainer.className = 'multiplayer-status';
    
    // Countdown display
    this.countdownDisplay = document.createElement('div');
    this.countdownDisplay.className = 'countdown-display';
    this.countdownDisplay.textContent = '';
    this.gameStatusContainer.appendChild(this.countdownDisplay);
    
    // Player count
    this.playerCountDisplay = document.createElement('div');
    this.playerCountDisplay.className = 'player-count';
    this.playerCountDisplay.textContent = 'Players: 0/30';
    this.gameStatusContainer.appendChild(this.playerCountDisplay);
    
    // Game status
    this.gameStatusDisplay = document.createElement('div');
    this.gameStatusDisplay.className = 'game-status';
    this.gameStatusDisplay.textContent = 'Waiting for players...';
    this.gameStatusContainer.appendChild(this.gameStatusDisplay);
    
    this.multiplayerContainer.appendChild(this.gameStatusContainer);
  }
  
  /**
   * Create player list UI
   */
  createPlayerListUI() {
    this.playerListContainer = document.createElement('div');
    this.playerListContainer.className = 'player-list-container';
    
    const header = document.createElement('h3');
    header.textContent = 'Players';
    this.playerListContainer.appendChild(header);
    
    const list = document.createElement('ul');
    list.className = 'player-list';
    this.playerList = list;
    this.playerListContainer.appendChild(list);
    
    this.multiplayerContainer.appendChild(this.playerListContainer);
  }
  
  /**
   * Create arena indicator
   */
  createArenaIndicator() {
    this.arenaIndicator = document.createElement('div');
    this.arenaIndicator.className = 'arena-indicator';
    this.arenaIndicator.style.display = 'none';
    document.body.appendChild(this.arenaIndicator);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Connect button
    this.connectButton.addEventListener('click', () => {
      const playerName = this.playerNameInput.value.trim();
      const serverAddress = this.serverAddressInput.value.trim();
      
      if (playerName && serverAddress) {
        this.connectToServer(playerName, serverAddress);
      }
    });
    
    // Disconnect button
    this.disconnectButton.addEventListener('click', () => {
      this.disconnectFromServer();
    });
    
    // Set up event callbacks for multiplayer manager
    this.multiplayerManager.onConnectionSuccess = () => {
      this.handleConnectionSuccess();
    };
    
    this.multiplayerManager.onConnectionError = (error) => {
      this.handleConnectionError(error);
    };
    
    this.multiplayerManager.onGameStateChange = (state) => {
      this.updateUIFromGameState(state);
    };
    
    this.multiplayerManager.onPlayerJoin = (data) => {
      this.updatePlayerList();
    };
    
    this.multiplayerManager.onPlayerLeave = (data) => {
      this.updatePlayerList();
    };
    
    this.multiplayerManager.onGameOver = (winnerName) => {
      this.handleGameOver(winnerName);
    };
  }
  
  /**
   * Add CSS styles for multiplayer UI
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .multiplayer-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 35, 66, 0.9);
        border: 2px solid #0CC7C7;
        box-shadow: 0 0 25px rgba(0, 180, 240, 0.5);
        border-radius: 8px;
        padding: 20px;
        width: 450px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 1000;
        color: white;
        font-family: Arial, sans-serif;
      }
      
      .multiplayer-lobby h2 {
        color: #0CC7C7;
        text-align: center;
        margin-top: 0;
      }
      
      .multiplayer-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .multiplayer-form label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 14px;
      }
      
      .multiplayer-form input {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #0CC7C7;
        background: rgba(0, 0, 0, 0.3);
        color: white;
      }
      
      .multiplayer-form button {
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .connect-button {
        background: #0CC7C7;
        color: #0a2342;
        border: none;
      }
      
      .connect-button:hover {
        background: #0ffafa;
        box-shadow: 0 0 10px rgba(12, 199, 199, 0.5);
      }
      
      .disconnect-button {
        background: #ff4757;
        color: white;
        border: none;
      }
      
      .disconnect-button:hover {
        background: #ff6b81;
        box-shadow: 0 0 10px rgba(255, 71, 87, 0.5);
      }
      
      .multiplayer-description {
        background: rgba(0, 0, 0, 0.2);
        padding: 10px;
        border-radius: 4px;
        margin-top: 15px;
      }
      
      .multiplayer-description h3 {
        color: #0CC7C7;
        margin-top: 0;
      }
      
      .multiplayer-description ul {
        padding-left: 20px;
      }
      
      .multiplayer-status {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.2);
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
      }
      
      .countdown-display {
        font-size: 24px;
        font-weight: bold;
        color: #0CC7C7;
      }
      
      .player-count {
        font-size: 14px;
      }
      
      .game-status {
        width: 100%;
        text-align: center;
        margin-top: 5px;
        font-weight: bold;
      }
      
      .player-list-container {
        background: rgba(0, 0, 0, 0.2);
        padding: 10px;
        border-radius: 4px;
      }
      
      .player-list-container h3 {
        color: #0CC7C7;
        margin-top: 0;
      }
      
      .player-list {
        max-height: 200px;
        overflow-y: auto;
        padding-left: 0;
        list-style-type: none;
      }
      
      .player-list li {
        padding: 5px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
      }
      
      .player-list li:last-child {
        border-bottom: none;
      }
      
      .player-color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
      }
      
      .player-status {
        margin-left: auto;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 10px;
      }
      
      .player-alive {
        background: #2ecc71;
        color: white;
      }
      
      .player-dead {
        background: #e74c3c;
        color: white;
      }
      
      .player-spectating {
        background: #7f8c8d;
        color: white;
      }
      
      .arena-indicator {
        position: absolute;
        border: 2px solid rgba(255, 0, 0, 0.5);
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
        pointer-events: none;
        z-index: 10;
      }
      
      @media (max-width: 480px) {
        .multiplayer-container {
          width: 90%;
          padding: 10px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Connect to the multiplayer server
   */
  async connectToServer(playerName, serverAddress) {
    // Disable connect button during connection attempt
    this.connectButton.disabled = true;
    this.connectButton.textContent = 'Connecting...';
    
    // Set server address
    this.multiplayerManager.setServerAddress(serverAddress);
    
    // Attempt connection
    const success = await this.multiplayerManager.connect(playerName);
    
    // Re-enable button if failed
    if (!success) {
      this.connectButton.disabled = false;
      this.connectButton.textContent = 'Connect';
    }
  }
  
  /**
   * Handle successful connection to server
   */
  handleConnectionSuccess() {
    // Update UI
    this.connectButton.style.display = 'none';
    this.disconnectButton.style.display = 'block';
    this.playerNameInput.disabled = true;
    this.serverAddressInput.disabled = true;
    
    // Show game status
    this.gameStatusContainer.style.display = 'block';
    this.playerListContainer.style.display = 'block';
    
    // Update player list
    this.updatePlayerList();
    
    // Show arena indicator when game starts
    this.arenaIndicator.style.display = 'block';
  }
  
  /**
   * Handle connection error
   */
  handleConnectionError(error) {
    // Show error message
    alert(`Connection error: ${error}`);
    
    // Reset UI
    this.connectButton.disabled = false;
    this.connectButton.textContent = 'Connect';
  }
  
  /**
   * Disconnect from the server
   */
  disconnectFromServer() {
    // Disconnect
    this.multiplayerManager.disconnect();
    
    // Update UI
    this.connectButton.style.display = 'block';
    this.disconnectButton.style.display = 'none';
    this.playerNameInput.disabled = false;
    this.serverAddressInput.disabled = false;
    
    // Hide arena indicator
    this.arenaIndicator.style.display = 'none';
  }
  
  /**
   * Update UI based on game state
   */
  updateUIFromGameState(state) {
    // Update player count
    const aliveCount = this.multiplayerManager.getAliveCount();
    const totalPlayers = this.multiplayerManager.getTotalPlayers();
    this.playerCountDisplay.textContent = `Players: ${aliveCount}/${totalPlayers} alive`;
    
    // Update game status
    const gameState = this.multiplayerManager.getGameState();
    let statusText = '';
    
    switch (gameState) {
      case GAME_CONSTANTS.STATE.WAITING:
        statusText = 'Waiting for players...';
        this.countdownDisplay.textContent = '';
        break;
        
      case GAME_CONSTANTS.STATE.STARTING:
        statusText = 'Game starting soon!';
        this.countdownDisplay.textContent = state.countdownTime;
        break;
        
      case GAME_CONSTANTS.STATE.PLAYING:
        statusText = 'Game in progress';
        this.countdownDisplay.textContent = '';
        this.updateArenaIndicator(state);
        break;
        
      case GAME_CONSTANTS.STATE.GAME_OVER:
        statusText = `Game over! ${state.winnerName} wins!`;
        this.countdownDisplay.textContent = '';
        break;
    }
    
    this.gameStatusDisplay.textContent = statusText;
    
    // Update player list to reflect current states
    this.updatePlayerList();
  }
  
  /**
   * Update the arena indicator
   */
  updateArenaIndicator(state) {
    if (!state || state.areaPercentage >= 100) {
      this.arenaIndicator.style.display = 'none';
      return;
    }
    
    // Get canvas dimensions and position
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate the shrinking arena
    const shrinkScale = state.areaPercentage / 100;
    const centerX = canvasRect.left + canvasRect.width / 2;
    const centerY = canvasRect.top + canvasRect.height / 2;
    
    // Size of the shrunk arena
    const arenaWidth = canvasRect.width * shrinkScale;
    const arenaHeight = canvasRect.height * shrinkScale;
    
    // Set indicator position
    this.arenaIndicator.style.left = `${centerX - arenaWidth / 2}px`;
    this.arenaIndicator.style.top = `${centerY - arenaHeight / 2}px`;
    this.arenaIndicator.style.width = `${arenaWidth}px`;
    this.arenaIndicator.style.height = `${arenaHeight}px`;
    
    // Ensure it's visible
    this.arenaIndicator.style.display = 'block';
    
    // Make it pulse when area is small
    if (state.areaPercentage < 60) {
      this.arenaIndicator.style.borderColor = 'rgba(255, 0, 0, 0.7)';
      this.arenaIndicator.style.animation = 'pulse 1s infinite';
    } else {
      this.arenaIndicator.style.borderColor = 'rgba(255, 0, 0, 0.5)';
      this.arenaIndicator.style.animation = 'none';
    }
  }
  
  /**
   * Update the player list
   */
  updatePlayerList() {
    // Clear existing list
    this.playerList.innerHTML = '';
    
    // Get players
    const players = this.multiplayerManager.players;
    if (!players) return;
    
    // Add player items
    for (const sessionId in players) {
      const player = players[sessionId];
      const isLocal = sessionId === this.multiplayerManager.localSessionId;
      
      // Create list item
      const item = document.createElement('li');
      
      // Add color indicator
      const colorIndicator = document.createElement('span');
      colorIndicator.className = 'player-color-indicator';
      colorIndicator.style.backgroundColor = this.multiplayerManager.getPlayerColor(player.playerIndex);
      item.appendChild(colorIndicator);
      
      // Add player name (with "You" indicator for local player)
      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${player.name}${isLocal ? ' (You)' : ''}`;
      item.appendChild(nameSpan);
      
      // Add status indicator
      const statusSpan = document.createElement('span');
      statusSpan.className = 'player-status';
      
      switch (player.state) {
        case GAME_CONSTANTS.PLAYER_STATE.ALIVE:
          statusSpan.textContent = 'Alive';
          statusSpan.classList.add('player-alive');
          break;
          
        case GAME_CONSTANTS.PLAYER_STATE.DEAD:
          statusSpan.textContent = 'Eliminated';
          statusSpan.classList.add('player-dead');
          break;
          
        case GAME_CONSTANTS.PLAYER_STATE.SPECTATING:
          statusSpan.textContent = 'Spectating';
          statusSpan.classList.add('player-spectating');
          break;
      }
      
      item.appendChild(statusSpan);
      
      // Add to list
      this.playerList.appendChild(item);
    }
  }
  
  /**
   * Handle game over
   */
  handleGameOver(winnerName) {
    // Update game status
    this.gameStatusDisplay.textContent = `Game over! ${winnerName} wins!`;
    
    // Add restart button if not exists
    if (!this.restartButton) {
      this.restartButton = document.createElement('button');
      this.restartButton.textContent = 'Play Again';
      this.restartButton.className = 'connect-button';
      this.restartButton.addEventListener('click', () => {
        this.multiplayerManager.requestRestart();
      });
      this.gameStatusContainer.appendChild(this.restartButton);
    } else {
      this.restartButton.style.display = 'block';
    }
  }
  
  /**
   * Show the multiplayer UI
   */
  show() {
    this.multiplayerContainer.style.display = 'block';
    this.isVisible = true;
  }
  
  /**
   * Hide the multiplayer UI
   */
  hide() {
    this.multiplayerContainer.style.display = 'none';
    this.isVisible = false;
  }
  
  /**
   * Toggle the multiplayer UI visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this.isVisible;
  }
}
