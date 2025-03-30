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

// Desktop-specific settings to override base settings on larger screens
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
}

// Key mappings
export const KEYS = {
  UP: ['ArrowUp', 'Up', 'w', 'W'],
  DOWN: ['ArrowDown', 'Down', 's', 'S'],
  LEFT: ['ArrowLeft', 'Left', 'a', 'A'],
  RIGHT: ['ArrowRight', 'Right', 'd', 'D'],
  RESTART: ['r', 'R'],
}
