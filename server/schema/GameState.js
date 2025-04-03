import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { PlayerSchema } from "./PlayerSchema.js";
import { ObstacleSchema } from "./ObstacleSchema.js";
import { GAME_CONSTANTS } from "../constants/serverConstants.js";

/**
 * GameState defines the full synchronized game state
 */
class GameState extends Schema {
  constructor() {
    super();
    
    // Initialize game state
    this.gameState = GAME_CONSTANTS.STATE.WAITING;
    this.elapsedTime = 0;
    this.startTime = 0;
    this.countdownTime = 5; // 5 second countdown before game starts
    
    // Arena settings
    this.arenaWidth = 800;
    this.arenaHeight = 600;
    this.areaPercentage = GAME_CONSTANTS.ARENA.INITIAL_AREA_PERCENTAGE;
    this.nextShrinkTime = 0;
    
    // Create collections for players and obstacles
    this.players = new MapSchema();
    this.obstacles = new ArraySchema();
    
    // Game statistics
    this.aliveCount = 0;
    this.totalPlayers = 0;
    this.winnerName = "";
    
    // Last update time for delta calculations
    this.lastUpdateTime = Date.now();
  }
  
  // Initialize a new player
  createPlayer(sessionId) {
    const playerIndex = this.totalPlayers;
    const player = new PlayerSchema(sessionId, playerIndex);
    
    // Position player at bottom of screen
    player.resetPosition(this.arenaWidth, this.arenaHeight);
    
    this.players[sessionId] = player;
    this.aliveCount++;
    this.totalPlayers++;
    
    return player;
  }
  
  // Remove a player by session ID
  removePlayer(sessionId) {
    if (this.players[sessionId]) {
      // If player was alive, decrement alive count
      if (this.players[sessionId].state === GAME_CONSTANTS.PLAYER_STATE.ALIVE) {
        this.aliveCount--;
      }
      
      delete this.players[sessionId];
    }
  }
  
  // Initialize obstacles
  initializeObstacles(initialCount = 5) {
    this.obstacles = new ArraySchema();
    
    for (let i = 0; i < initialCount; i++) {
      this.createObstacle();
    }
  }
  
  // Create a new obstacle
  createObstacle() {
    const obstacle = new ObstacleSchema(this.obstacles.length);
    
    // Get player positions for obstacle placement
    const playerPositions = [];
    for (const sessionId in this.players) {
      const player = this.players[sessionId];
      if (player.state === GAME_CONSTANTS.PLAYER_STATE.ALIVE) {
        playerPositions.push({ x: player.x, y: player.y });
      }
    }
    
    // Initialize obstacle position
    obstacle.reset(this.arenaWidth, this.arenaHeight, playerPositions);
    
    this.obstacles.push(obstacle);
    return obstacle;
  }
  
  // Check for win condition
  checkWinCondition() {
    // Game is won when only one player remains alive
    if (this.aliveCount === 1 && this.totalPlayers > 1) {
      // Find the last player standing
      for (const sessionId in this.players) {
        const player = this.players[sessionId];
        if (player.state === GAME_CONSTANTS.PLAYER_STATE.ALIVE) {
          this.winnerName = player.name;
          this.gameState = GAME_CONSTANTS.STATE.GAME_OVER;
          break;
        }
      }
      return true;
    }
    
    // No players left alive (shouldn't happen normally)
    if (this.aliveCount === 0 && this.gameState === GAME_CONSTANTS.STATE.PLAYING) {
      this.gameState = GAME_CONSTANTS.STATE.GAME_OVER;
      this.winnerName = "No one";
      return true;
    }
    
    return false;
  }
  
  // Update game state
  update(deltaTime) {
    // Update based on current game state
    switch (this.gameState) {
      case GAME_CONSTANTS.STATE.WAITING:
        // Check if enough players to start
        if (this.totalPlayers >= 2) { // Minimum of 2 players for testing (can be increased later)
          this.gameState = GAME_CONSTANTS.STATE.STARTING;
          this.startTime = Date.now() + (this.countdownTime * 1000);
        }
        break;
        
      case GAME_CONSTANTS.STATE.STARTING:
        // Update countdown
        const currentTime = Date.now();
        const remainingTime = Math.max(0, this.startTime - currentTime);
        this.countdownTime = Math.ceil(remainingTime / 1000);
        
        // Start game when countdown reaches zero
        if (this.countdownTime <= 0) {
          this.gameState = GAME_CONSTANTS.STATE.PLAYING;
          this.elapsedTime = 0;
          this.nextShrinkTime = Date.now() + GAME_CONSTANTS.ARENA.SHRINK_INTERVAL;
          
          // Initialize obstacles
          this.initializeObstacles(5 + Math.floor(this.totalPlayers / 5));
        }
        break;
        
      case GAME_CONSTANTS.STATE.PLAYING:
        // Update elapsed time
        this.elapsedTime += deltaTime;
        
        // Update arena shrinking
        if (Date.now() >= this.nextShrinkTime && 
            this.areaPercentage > GAME_CONSTANTS.ARENA.MIN_AREA_PERCENTAGE) {
          // Shrink the play area
          this.areaPercentage -= GAME_CONSTANTS.ARENA.SHRINK_PERCENTAGE;
          this.areaPercentage = Math.max(this.areaPercentage, GAME_CONSTANTS.ARENA.MIN_AREA_PERCENTAGE);
          
          // Schedule next shrink
          this.nextShrinkTime = Date.now() + GAME_CONSTANTS.ARENA.SHRINK_INTERVAL;
        }
        
        // Update all players
        for (const sessionId in this.players) {
          const player = this.players[sessionId];
          if (player.state === GAME_CONSTANTS.PLAYER_STATE.ALIVE) {
            player.updateMovement(deltaTime, this.arenaWidth, this.arenaHeight);
            
            // Check if player is outside shrinking arena
            this.checkPlayerInArena(player);
          }
        }
        
        // Update all obstacles
        for (let i = 0; i < this.obstacles.length; i++) {
          const obstacle = this.obstacles[i];
          const needsReset = obstacle.update(deltaTime, this.arenaWidth);
          
          if (needsReset) {
            // Get player positions for obstacle placement
            const playerPositions = [];
            for (const sessionId in this.players) {
              const player = this.players[sessionId];
              if (player.state === GAME_CONSTANTS.PLAYER_STATE.ALIVE) {
                playerPositions.push({ x: player.x, y: player.y });
              }
            }
            
            obstacle.reset(this.arenaWidth, this.arenaHeight, playerPositions);
          }
          
          // Check collisions with all alive players
          this.checkObstacleCollisions(obstacle);
        }
        
        // Check if the game is over
        this.checkWinCondition();
        break;
        
      case GAME_CONSTANTS.STATE.GAME_OVER:
        // Game is over, wait for restart
        break;
    }
  }
  
  // Check if player is inside the arena boundaries
  checkPlayerInArena(player) {
    if (this.areaPercentage < 100) {
      // Calculate arena boundaries based on shrinking percentage
      const shrinkScale = this.areaPercentage / 100;
      
      // Original arena center
      const centerX = this.arenaWidth / 2;
      const centerY = this.arenaHeight / 2;
      
      // Shrunken arena dimensions
      const shrunkWidth = this.arenaWidth * shrinkScale;
      const shrunkHeight = this.arenaHeight * shrinkScale;
      
      // Shrunken arena boundaries
      const minX = centerX - (shrunkWidth / 2);
      const maxX = centerX + (shrunkWidth / 2);
      const minY = centerY - (shrunkHeight / 2);
      const maxY = centerY + (shrunkHeight / 2);
      
      // Check if player is outside arena
      if (player.x < minX || player.x + player.width > maxX || 
          player.y < minY || player.y + player.height > maxY) {
        // Player is outside arena, mark as dead
        player.markAsDead();
        this.aliveCount--;
      }
    }
  }
  
  // Check if obstacle collides with any players
  checkObstacleCollisions(obstacle) {
    for (const sessionId in this.players) {
      const player = this.players[sessionId];
      
      // Only check collisions for active players
      if (player.state === GAME_CONSTANTS.PLAYER_STATE.ALIVE) {
        if (obstacle.checkCollision(player)) {
          // Mark player as dead
          player.markAsDead();
          this.aliveCount--;
        }
      }
    }
  }
  
  // Reset game state for a new round
  resetGame() {
    this.gameState = GAME_CONSTANTS.STATE.WAITING;
    this.elapsedTime = 0;
    this.winnerName = "";
    this.areaPercentage = GAME_CONSTANTS.ARENA.INITIAL_AREA_PERCENTAGE;
    
    // Reset alive count
    this.aliveCount = 0;
    
    // Reset players
    for (const sessionId in this.players) {
      const player = this.players[sessionId];
      player.resetPosition(this.arenaWidth, this.arenaHeight);
      player.score = 0;
      player.state = GAME_CONSTANTS.PLAYER_STATE.ALIVE;
      this.aliveCount++;
    }
    
    // Clear obstacles
    this.obstacles = new ArraySchema();
  }
}

// Define the schema types for network synchronization
type("string")(GameState.prototype, "gameState");
type("number")(GameState.prototype, "elapsedTime");
type("number")(GameState.prototype, "startTime");
type("number")(GameState.prototype, "countdownTime");
type("number")(GameState.prototype, "arenaWidth");
type("number")(GameState.prototype, "arenaHeight");
type("number")(GameState.prototype, "areaPercentage");
type("number")(GameState.prototype, "nextShrinkTime");
type({ map: PlayerSchema })(GameState.prototype, "players");
type([ObstacleSchema])(GameState.prototype, "obstacles");
type("number")(GameState.prototype, "aliveCount");
type("number")(GameState.prototype, "totalPlayers");
type("string")(GameState.prototype, "winnerName");

export { GameState };
