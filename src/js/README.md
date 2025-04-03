# Game Codebase Structure

This document explains the optimized structure of the game's codebase after reorganization.

## Folder Structure

The codebase is now organized into logical modules:

```
src/
├── js/
│   ├── core/              # Core game engine components
│   │   ├── Game.js        # Main game controller
│   │   ├── constants.js   # Game constants (consolidated)
│   │   └── main.js        # Entry point
│   ├── managers/          # Manager classes that orchestrate game systems
│   │   ├── AssetManager.js
│   │   ├── InputManager.js
│   │   ├── ObstacleManager.js
│   │   ├── ParticleSystem.js
│   │   └── UIManager.js
│   ├── objects/           # Game entities and objects
│   │   ├── Background.js
│   │   ├── Obstacle.js
│   │   └── Player.js
│   ├── multiplayer/       # Multiplayer components
│   │   ├── MultiplayerManager.js
│   │   └── MultiplayerUI.js
│   ├── ui/                # User interface components
│   │   └── TouchControls.js
│   └── utils/             # Utility functions and helpers
│       ├── sprites.js
│       └── utils.js
├── assets/                # Game assets 
│   ├── images/            # Game images
│   └── audio/             # Game audio (future)
└── styles/                # CSS styles
    └── style.css
```

## Key Improvements

1. **Modular Organization**: Code is now organized by functionality into logical modules
2. **Clear Separation of Concerns**: Each file has a single responsibility
3. **Consolidated Constants**: Game constants are now centralized in one file
4. **Optimized Memory Usage**: Object pooling for particles with efficient memory management
5. **Asset Management**: Robust asset loading with error handling and retries
6. **Clean Interfaces**: Consistent interfaces between modules

## Import Paths

All import paths have been updated to reflect the new folder structure. For example:

```javascript
// Old import
import Player from './Player.js';

// New import
import Player from '../objects/Player.js';
```

## Import Conventions

- Relative paths are used for imports within the same module
- Module paths are used for imports across different modules
- When importing from utils, use the module path (e.g., `import { randomIntFromInterval } from '../utils/utils.js'`)
