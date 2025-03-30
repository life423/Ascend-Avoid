// Game constants shared between client and server
const GAME_CONSTANTS = {
  // Player settings
  PLAYER: {
    BASE_WIDTH: 30,
    BASE_HEIGHT: 30,
    MIN_STEP: 3,
    BASE_SPEED: 5,
  },
  
  // Obstacle settings
  OBSTACLE: {
    BASE_SPEED: 2,
    MIN_WIDTH: 30,
    MAX_WIDTH: 60,
  },
  
  // Game settings
  GAME: {
    WINNING_LINE: 40,
    MAX_PLAYERS: 30,
    STATE_UPDATE_RATE: 1000 / 30, // 30 updates per second
    ROOM_NAME: "last_player_standing",
  },
  
  // Game states
  STATE: {
    WAITING: "waiting",
    STARTING: "starting",
    PLAYING: "playing",
    GAME_OVER: "game_over",
  },
  
  // Player states
  PLAYER_STATE: {
    ALIVE: "alive",
    DEAD: "dead",
    SPECTATING: "spectating",
  },
  
  // Arena settings
  ARENA: {
    INITIAL_AREA_PERCENTAGE: 100,
    SHRINK_INTERVAL: 30000, // 30 seconds between shrinks
    SHRINK_PERCENTAGE: 10, // Shrink by 10% each time
    MIN_AREA_PERCENTAGE: 40, // Don't shrink below 40% of original size
  },
};

// Player colors for differentiation
const PLAYER_COLORS = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#E91E63", // Pink
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#FFC107", // Amber
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#F44336", // Red (darker)
  "#FF5722", // Deep Orange
  "#673AB7", // Deep Purple
  "#3F51B5", // Indigo
  "#03A9F4", // Light Blue
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#4CAF50", // Green
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#FFEB3B", // Yellow
  "#FFC107", // Amber
  "#FF9800", // Orange
  "#FF5722", // Deep Orange
  "#795548", // Brown
  "#9E9E9E"  // Grey
];

// Export constants
module.exports = { GAME_CONSTANTS, PLAYER_COLORS };
