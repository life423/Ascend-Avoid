// Game constants
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
}

// Key mappings
export const KEYS = {
  UP: ['ArrowUp', 'Up', 'w', 'W'],
  DOWN: ['ArrowDown', 'Down', 's', 'S'],
  LEFT: ['ArrowLeft', 'Left', 'a', 'A'],
  RIGHT: ['ArrowRight', 'Right', 'd', 'D'],
  RESTART: ['r', 'R'],
}
