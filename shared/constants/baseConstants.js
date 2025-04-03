/**
 * Base game constants shared between client and server
 * This file serves as the single source of truth for core game constants
 */

// Player settings
export const PLAYER = {
  BASE_WIDTH: 30,
  BASE_HEIGHT: 30,
  MIN_STEP: 3,
  BASE_SPEED: 5,
  SIZE_RATIO: 0.04, // From GAME_SETTINGS.PLAYER_SIZE_RATIO
};

// Obstacle settings
export const OBSTACLE = {
  BASE_SPEED: 2,
  MIN_WIDTH: 30,
  MAX_WIDTH: 60,
  MIN_WIDTH_RATIO: 0.08, // From GAME_SETTINGS.OBSTACLE_MIN_WIDTH_RATIO
  MAX_WIDTH_RATIO: 0.18, // From GAME_SETTINGS.OBSTACLE_MAX_WIDTH_RATIO
};

// Game settings
export const GAME = {
  WINNING_LINE: 40,
  MAX_PLAYERS: 30,
  STATE_UPDATE_RATE: 1000 / 30, // 30 updates per second
  ROOM_NAME: "last_player_standing",
  MAX_OBSTACLES: 12, // From GAME_SETTINGS.MAX_CARS
  DIFFICULTY_INCREASE_RATE: 0.15, // From GAME_SETTINGS
};

// Game states
export const STATE = {
  READY: 'ready',    // From GameConfig.STATE
  WAITING: "waiting",
  STARTING: "starting",
  PLAYING: "playing",
  GAME_OVER: "game_over",
  PAUSED: "paused",  // From GameConfig.STATE
};

// Player states
export const PLAYER_STATE = {
  ALIVE: "alive",
  DEAD: "dead",
  SPECTATING: "spectating",
};

// Arena settings
export const ARENA = {
  INITIAL_AREA_PERCENTAGE: 100,
  SHRINK_INTERVAL: 30000, // 30 seconds between shrinks
  SHRINK_PERCENTAGE: 10, // Shrink by 10% each time
  MIN_AREA_PERCENTAGE: 40, // Don't shrink below 40% of original size
};

// Key mappings (from constants.js)
export const KEYS = {
  UP: ['ArrowUp', 'Up', 'w', 'W'],
  DOWN: ['ArrowDown', 'Down', 's', 'S'],
  LEFT: ['ArrowLeft', 'Left', 'a', 'A'],
  RIGHT: ['ArrowRight', 'Right', 'd', 'D'],
  RESTART: ['r', 'R'],
};

// Player colors for differentiation
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

// Desktop-specific settings (from constants.js DESKTOP_SETTINGS)
export const DESKTOP_SETTINGS = {
  PLAYER_SIZE_RATIO: 0.03,
  MIN_STEP: 10,
  OBSTACLE_MIN_WIDTH_RATIO: 0.06,
  OBSTACLE_MAX_WIDTH_RATIO: 0.15,
  BASE_SPEED: 3.0,
  DIFFICULTY_INCREASE_RATE: 0.18
};

// Bundle all constants for convenient access
export const GAME_CONSTANTS = {
  PLAYER,
  OBSTACLE,
  GAME,
  STATE,
  PLAYER_STATE,
  ARENA
};
