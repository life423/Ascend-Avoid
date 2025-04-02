/**
 * Consolidated game constants file that combines both settings and multiplayer constants.
 * This makes configuration management more maintainable and centralized.
 */

// Game constants shared between all components
export const GAME_CONSTANTS = {
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

// Player colors for multiplayer
export const PLAYER_COLORS = [
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

// Game settings with desktop/mobile adaptive configurations
export const GAME_SETTINGS = {
  // Winning line position (higher value = closer to top)
  WINNING_LINE: 20,

  // Base movement speed of obstacles
  BASE_SPEED: 2.5,

  // Player configuration
  PLAYER_SIZE_RATIO: 0.04,
  MIN_STEP: 12, // Player movement speed (lower = faster)

  // Obstacles configuration
  OBSTACLE_MIN_WIDTH_RATIO: 0.08,
  OBSTACLE_MAX_WIDTH_RATIO: 0.18,
  MAX_CARS: 12,

  // Difficulty settings
  DIFFICULTY_INCREASE_RATE: 0.15, // How quickly difficulty increases with score
};

// Desktop-specific settings that override base settings
export const DESKTOP_SETTINGS = {
  // Smaller player on desktop for more precise control
  PLAYER_SIZE_RATIO: 0.03,
  
  // Slightly faster player movement for desktop (lower = faster)
  MIN_STEP: 10,
  
  // Narrower obstacles make game more challenging but fair on desktop
  OBSTACLE_MIN_WIDTH_RATIO: 0.06,
  OBSTACLE_MAX_WIDTH_RATIO: 0.15,
  
  // Slightly faster baseline speed on desktop
  BASE_SPEED: 3.0,
  
  // Increase difficulty slightly faster on desktop
  DIFFICULTY_INCREASE_RATE: 0.18
};

// Key mappings for controls
export const KEYS = {
  UP: ['ArrowUp', 'Up', 'w', 'W'],
  DOWN: ['ArrowDown', 'Down', 's', 'S'],
  LEFT: ['ArrowLeft', 'Left', 'a', 'A'],
  RIGHT: ['ArrowRight', 'Right', 'd', 'D'],
  RESTART: ['r', 'R'],
};
