# File Structure Cleanup Plan

## Current Issues

1. **Duplicate Code**: JavaScript and TypeScript versions of the same files coexist
2. **Multiple Entry Points**: Multiple HTML files and JavaScript entry points
3. **Inconsistent Import Patterns**: Mix of relative and absolute paths
4. **Duplicate Constants**: Same constants defined in multiple locations
5. **Inconsistent File Structure**: Files organized differently across directories

## Target Directory Structure

```
project-root/
├── src/
│   ├── assets/                  # All static assets (images, audio, etc.)
│   │   ├── images/
│   │   └── sounds/
│   │
│   ├── core/                    # Core game engine logic (TypeScript)
│   │   ├── Game.ts              # Main game controller acting as Context
│   │   ├── GameConfig.ts        # Configuration settings and initialization
│   │   ├── GameMode.ts          # Base class for game modes (Strategy Pattern)
│   │   ├── SinglePlayerMode.ts  # Single player implementation of GameMode
│   │   └── MultiplayerMode.ts   # Multiplayer implementation of GameMode
│   │
│   ├── entities/                # Game entities or objects (TypeScript)
│   │   ├── Player.ts            # Player object/entity and related logic
│   │   ├── Obstacle.ts          # Obstacle entity logic
│   │   ├── Background.ts        # Background visual logic
│   │   └── ParticleSystem.ts    # Particles effects management
│   │
│   ├── managers/                # Managers handling various subsystems (TypeScript)
│   │   ├── AssetManager.ts      # Loads and caches assets
│   │   ├── InputManager.ts      # Handles keyboard, mouse, and touch input
│   │   ├── ObstacleManager.ts   # Manages spawning and lifecycle of obstacles
│   │   ├── UIManager.ts         # Manages UI overlays, menus, and score displays
│   │   └── ResponsiveManager.ts # Handles responsive design adaptations
│   │
│   ├── ui/                      # UI-specific code and controls (TypeScript)
│   │   ├── MultiplayerUI.ts     # Handles user interface for multiplayer features
│   │   └── TouchControls.ts     # Implements on-screen controls for mobile
│   │
│   ├── utils/                   # Utility functions and helper modules (TypeScript)
│   │   └── utils.ts             # Common helpers that span multiple modules
│   │
│   ├── constants/               # Shared constants
│   │   ├── baseConstants.ts     # Base game constants
│   │   └── gameConstants.ts     # Game-specific constants
│   │
│   ├── types.d.ts               # Global type definitions
│   ├── index.html               # Main HTML entry point
│   ├── index.ts                 # Main application entry point
│   └── styles/                  # CSS styles
│       └── style.css            # Main stylesheet
│
├── server/                      # Server-side code (Node.js)
│   ├── constants/               # Server constants
│   ├── rooms/                   # Colyseus room definitions
│   └── schema/                  # State schema definitions
│
├── public/                      # Public assets (copied as-is to dist)
│
└── shared/                      # Code shared between client and server
    └── constants/               # Constants shared between client and server
```

## Files to Consolidate/Move

1. Move TypeScript files to their appropriate directories (most are already in the right place)
2. Consolidate constants from `shared/` and `src/js/shared/` into one location
3. Remove JavaScript files that have TypeScript counterparts
4. Update import paths throughout the codebase

## Entry Points to Consolidate

1. Keep `src/index.html` as the main entry point
2. Remove or update redirects from root `index.html`
3. Remove `app.js` legacy wrapper
4. Consolidate `src/js/index.js` and `src/js/main.js` into `src/index.ts`
5. Update Vite configuration to reflect the new structure
